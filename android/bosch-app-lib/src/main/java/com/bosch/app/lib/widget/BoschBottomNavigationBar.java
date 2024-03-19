package com.bosch.app.lib.widget;

import android.content.Context;
import android.util.AttributeSet;

import com.bosch.app.lib.R;
import com.bosch.app.lib.adapter.BoschNavigationBarAdapter;

import java.util.ArrayList;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 05.12.17.
 */

/**
 * Always use {@link R.style#Widget_Bosch_BottomNavigationBar} in xml declaration
 * Needs to be used together with {@link BoschNavigationBarAdapter}
 * <p>
 * Definition:
 * The Bottom Navigation allows quick switching between top level views of an app.
 * It is represented by an icon bar located in the bottom of the screen
 * that consists of minimum 3 to maximum 5 icons, promoting awareness of alternate views.
 * <p>
 * Usage:
 * It is recommended to use the Bottom Navigation:
 * - When your information architecture contains maximum 5 top level views
 * - When all top level views are equally important and do not include infrequent destinations
 * - When typical use cases with your app demand a frequent switching between top level views
 * - When functionalities, controls or views are not supposed to be affected by a fixed bottom bar
 * <p>
 * The Bottom Navigation should not be paired with the {@link BoschSideNavigation}.
 * To decide which navigation pattern fits better to your app, see further hints in the section about Navigation.
 */
public class BoschBottomNavigationBar extends BoschNavigationBar {

    public BoschBottomNavigationBar(Context context) {
        super(context);
    }

    public BoschBottomNavigationBar(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public BoschBottomNavigationBar(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    /**
     * is called from {@link BoschNavigationBar} and creates the tabs
     *
     * @param items
     */
    @Override
    protected void createTabs(final ArrayList<BoschNavigationBarAdapter.BoschNavigationBarItem> items) {
        if (items != null) {
            setTabGravity(GRAVITY_FILL);
            setTabMode(MODE_FIXED);
            setupTabs(items, R.layout.bosch_navigation_bar_bottom_item);
        }
    }

    /**
     * Do Nothing, is only needed for {@link BoschSubNavigationBar}
     *
     * @param makeScrollable
     */
    @Override
    protected void updateGravityMode(final boolean makeScrollable) {

    }

}
