/**
 * Copyright (C) 2011 BonitaSoft S.A.
 * BonitaSoft, 31 rue Gustave Eiffel - 38000 Grenoble
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2.0 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
package org.bonitasoft.console.common.server.preferences.constants;

import static org.bonitasoft.console.common.server.preferences.constants.WebBonitaConstantsTenancyImpl.ICONS_WORK_FOLDER_NAME;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

/**
 * @author Anthony Birembaut
 */
public class WebBonitaConstantsUtils {

    private static Map<Long, WebBonitaConstantsUtils> tenantConstantsUtils = new HashMap<>();

    private WebBonitaConstants webBonitaConstants;

    public synchronized static WebBonitaConstantsUtils getInstance(final long tenantId) {
        WebBonitaConstantsUtils instance = tenantConstantsUtils.get(tenantId);
        if (instance == null) {
            instance = new WebBonitaConstantsUtils(tenantId);
            tenantConstantsUtils.put(tenantId, instance);
        }
        return instance;
    }

    public synchronized static WebBonitaConstantsUtils getInstance() {
        WebBonitaConstantsUtils instance = tenantConstantsUtils.get(null);
        if (instance == null) {
            instance = new WebBonitaConstantsUtils();
            tenantConstantsUtils.put(null, instance);
        }
        return instance;
    }

    protected WebBonitaConstantsUtils(final long tenantId) {
        webBonitaConstants = new WebBonitaConstantsTenancyImpl(tenantId);
    }

    protected WebBonitaConstantsUtils() {
        webBonitaConstants = new WebBonitaConstantsImpl();
    }

    /**
     * Get the folder where to write Tenant temporary files commons to all web
     * applications.
     */
    public File getTempFolder() {
        return getFolder(webBonitaConstants.getTempFolderPath());
    }

    /**
     * Get the folder where to get the Tenant conf files.
     */
    public File getConfFolder() {
        return getFolder(webBonitaConstants.getConfFolderPath());
    }

    /**
     * Get the folder of Tenant themes files (ie CSS files)
     */
    public File getPortalThemeFolder() {
        return getFolder(webBonitaConstants.getThemeFolderPath());
    }

    /**
     * Get the folder of the user Console default icons
     */
    public File getConsoleDefaultIconsFolder() {
        return new File(getPortalThemeFolder(), ICONS_WORK_FOLDER_NAME);
    }

    /**
     * /** Get the folder of the user Console user icons
     */
    public File getConsoleUserIconsFolder() {
        return getFolderFromBonitaHome(webBonitaConstants.getPortalUserIconsFolderPath());
    }

    /**
     * /** Get the folder of the user Console icons
     */
    public File getConsoleIconsFolder() {
        return getFolderFromBonitaHome(webBonitaConstants.getPortalIconsFolderPath());
    }

    /**
     * Get the folder of the user Console user icons
     */
    public File getConsoleRoleIconsFolder() {
        return getFolderFromBonitaHome(webBonitaConstants.getPortalRoleIconsFolderPath());
    }

    /**
     * Get the folder of Tenant report files
     */
    public File getReportFolder() {
        return getFolder(webBonitaConstants.getReportsTempFolderPath());
    }

    /**
     * Get the folder of Tenant pages files
     */
    public File getPagesFolder() {
        return getFolder(webBonitaConstants.getPagesTempFolderPath());
    }

    /**
     * Get the Tenant folder where to write Work files.
     */
    public File getFormsWorkFolder() {
        return getFolder(webBonitaConstants.getFormsTempFolderPath());
    }

    /**
     * Get the Tenant folder where to write BDM work files.
     */
    public File geBDMWorkFolder() {
        return getFolder(webBonitaConstants.getBDMTempFolderPath());
    }

    /**
     * Get the folder of the tenants directories
     */
    public File getTenantsFolder() {
        return getFolder(webBonitaConstants.getTenantsFolderPath());
    }

    /**
     * Get the folder of the Console group icons
     */
    public File getConsoleGroupIconsFolder() {
        return getFolderFromBonitaHome(webBonitaConstants.getPortalGroupIconsFolderPath());
    }

    // protected for test stubbing
    String getBonitaHomePath() {
        final String bonitaHomePath = System.getProperty(WebBonitaConstants.BONITA_HOME);
        if (bonitaHomePath == null) {
            throw new RuntimeException(WebBonitaConstants.BONITA_HOME + " system property not set!");
        }
        return bonitaHomePath;
    }

    private File getFolderFromBonitaHome(final String folderPath) {
        // do not try to create folders in Bonita-home:
        return new File(getBonitaHomePath(), folderPath);
    }

    private File getFolder(final String folderPath) {
        final File folder = new File(folderPath);
        if (!folder.exists()) {
            folder.mkdirs();
        }
        return folder;
    }

}
