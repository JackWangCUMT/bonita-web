/* jshint browser:true, jquery:true */
/* global localeRange:false, localePresets:false,  bonitasoft:false*/

var cookie = document.cookie;
var bosCookieValue = getCookie("bos_cookie");
var bosCookieObj = jQuery.parseJSON(bosCookieValue);

$.getScript("scripts/includes/daterangepicker." + (bosCookieObj ? bosCookieObj._l : "en") + ".js");

function getProfileId() {
    var paramsMap = {};
    location.hash.replace(/([^&=]+)=?([^&]*)(?:&+|$)/g, function (match, key, value) {
        (paramsMap[key] = paramsMap[key] || []).push(value);
    });
    var profileId = paramsMap["_pf"];
    if (profileId) return profileId;
    else return null;
}

function removeReportStyle() {
    $("table, div, tr", $(".report")).each(function () {
        var elt = $(this);
        if (elt.attr("style")) {
            if (elt.attr("style").indexOf("background") != -1) {
                return;
            }
            $(this).removeAttr("style");
        }
    });
    $("#report-form-ctn").parent().removeAttr("style");
}

function reportDateRangePicker(localeDateFormat, prefix) {
    $(".ui-daterangepickercontain").remove();
    try {
        $('#' + prefix + 'from, #' + prefix + 'to').daterangepicker({
            presetRanges: localeRange,
            presets: localePresets,
            dateFormat: localeDateFormat,
            constrainDates: true,
            onClose: function () {
                $(".ui-daterangepickercontain").remove();
                setTimeout(function () {
                    $('#report-form').submit();
                }, 500);
            }

        }).addClass("dateRangePickers");
    } catch (err) {

    }

    $("#report-form select").attr("onchange", "refreshReport(this.form, \"" + localeDateFormat + "\", \"" + prefix + "\")");
}

function hookReportFormSubmition(localeDateFormat, prefix) {
    $(document).delegate("#report-form", "submit", function (event) {
        event.stopPropagation();
        refreshReport(this, localeDateFormat, prefix);
        return false;
    });


    $(document).delegate(".report .bonita_report_hyperlink a, .report area", "click", function (event) {
        event.stopPropagation();
        var urlToRefresh = this.href + "&locale=" + bosCookieObj._l + "&_pf=" + getProfileId();
        $.ajax({
            url: urlToRefresh,
            cache: false,
            async: true,
            success: function (refreshResponse) {
                refreshResponse = forceImgRefresh(refreshResponse.substring(refreshResponse.indexOf("<div class=\"report\">"), refreshResponse.lastIndexOf("</div>")));
                $("div.report").html(refreshResponse);
                removeReportStyle();
                reportDateRangePicker(localeDateFormat, prefix);
                retrieveFieldsValues(urlToRefresh.split('?')[1], localeDateFormat);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $("div.report").html("<p>" + errorThrown + "</p>");
            }
        });
        return false;
    });

}

function refreshReport(e, localeDateFormat, prefix) {
    var reportForm = $(e),
        parseLocale = localeDateFormat.replace("yyyy", "yy").replace("yy", "yyyy").replace("mm", "M"),
        urlRefresh = reportForm.attr("action"),
        toDate, fromDate, toDateVal, fromDateVal, fromDateObj;


    try {
        toDate = $('#' + prefix + 'to', reportForm);
        fromDate = $('#' + prefix + 'from', reportForm);

        toDateVal = toDate.val();
        fromDateVal = fromDate.val();

        var toDateObj = Date.parseExact(toDateVal, parseLocale);
        fromDateObj = Date.parseExact(fromDateVal, parseLocale);

        fromDate.val(fromDateObj.getTime()); // 00:00:00
        toDate.val(toDateObj.getTime() + (24 * 3600 * 1000) - 1000); // 23:59:59
    } catch (err) {
        console.log("An error occured during date parsing");
    }

    var params = reportForm.serialize();

    try {
        toDate.val(toDateVal);
        fromDate.val(fromDateVal);
    } catch (err) {
        console.log("An error occured while setting date values");
    }

    $.ajax({
        beforeSend: function () {
            $("div.report").html("<div id=\"initloader\">" +
                "<div class=\"loader\">" +
                "<img src=\"images/loader.gif\" />" +
                "</div>" +
                "</div>");
        },
        url: urlRefresh,
        data: params + "&locale=" + bosCookieObj._l + "&_pf=" + getProfileId(),
        cache: false,
        async: true,
        success: function (refreshResponse) {
            refreshResponse = forceImgRefresh(refreshResponse.substring(refreshResponse.indexOf("<div class=\"report\">"), refreshResponse.lastIndexOf("</div>")));
            $("div.report").html(refreshResponse);
            removeReportStyle();
            reportDateRangePicker(localeDateFormat, prefix);
            retrieveFieldsValues(params, localeDateFormat);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $("div.report").html("<p>" + errorThrown + "</p>");
        }
    });
}

function retrieveFieldsValues(params, localeDateFormat) {
    var map = {};
    params.replace(/([^&=]+)=?([^&]*)(?:&+|$)/g, function (match, key, value) {
        (map[key] = map[key] || []).push(value);
    });
    $("div.report #report-form :input").each(function () {
        var field = $(this);
        var uriValue = decodeURIComponent(map[field.attr("name")]);
        if (uriValue) {
            if (field.is("input, textarea")) {
                if (field.is(".dateRangePickers")) {
                    if (uriValue % 1 === 0) {
                        uriValue = $.datepicker.formatDate(localeDateFormat, new Date(parseInt(uriValue)));
                    } else {
                        uriValue = Date.parseExact(uriValue, localeDateFormat); // if
                        // the
                        // date
                        // is
                        // returned
                        // in
                        // localized
                        // format
                        // instead
                        // timestamp
                    }
                    field.val(uriValue);
                } else {
                    field.val(uriValue);
                }
            } else if (field.is("select")) {
                field.data('uriValue', uriValue);
                field.prop("selectedIndex", $("option[value=\"" + uriValue + "\"]", field).prop("index"));
            }
        }
    });
}

function getCookie(c_name) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1) {
        c_start = c_value.indexOf(c_name + "=");
    }
    if (c_start == -1) {
        c_value = null;
    } else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1) {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start, c_end));
    }
    return c_value;
}

function forceImgRefresh(ajaxResponse) {
    var r = Math.random();
    var reg = /<img(.*)src=\"([^\s]*)\"(.*)([>|/>])/gi;
    return ajaxResponse.replace(reg, '<img$1src="$2&r=' + r + '"$3$4');
}

/*
 * Some utility methods for report's form.
 */
(function (bonitasoft, utils, assertion) {

    function append(element, option) {
        if (option) {
            var opt = document.createElement("option");
            opt.text = option.text;
            opt.value = option.val;
            element.append(opt);
        }
    }

    function getIndex(element, value) {
        return $("option[value=\"" + value + "\"]", element)
            .prop("index");
    }

    function select(element, value) {
        if (value) {
            element.prop("selectedIndex",
                getIndex(element, value));
        }
    }

    function populate(element, items, render) {
        items.forEach(function (item) {
            append(element, render(item));
        });
        select(element.data('uriValue'));
    }

    /*
     * Clear selector content as well as append
     * default option if defined.
     *
     * defaults - Optional. Default option to append after cleaning.
     */
    function clear(defaults) {
        assertion.isDefined(this.element);
        
        this.element.html('');
        if (defaults) {
            append(this.element, defaults);
        }
    }

    /*
     * Populate selector the items by calling renderer to append the options.
     *
     * items    - JSON array containing items to append
     * renderer - function called with the current item in parameter.
     *            It must return a literal object with val & text of the option.
     *            e.g { val: '', text: '' }
     */
    function add(items, render) {
        assertion.isDefined(items);
        assertion.isDefined(render);

        var that = this;
        items.forEach(function (item) {
            that.items.push(item);
        });
//        this.items.sort(function (a, b) {
//            return !(a > b);
//        });
        this.clear();
        populate(this.element, this.items, render);
    }

    /*
     * Constructor for the <select /> wrapper.
     *
     * element - JQuery object wrapping a <select />
     */
    function Select(element) {
        this.element = element;
        this.items = [];
    }
    Select.prototype.clear = clear;
    Select.prototype.add = add;

    // bonitasoft.utils.report.form
    utils.namespace.extend(bonitasoft, 'utils.report', function (report) {
        report.form = {
            Select: Select
        };
    });
})(bonitasoft, bonitasoft.utils, bonitasoft.utils.assertion);