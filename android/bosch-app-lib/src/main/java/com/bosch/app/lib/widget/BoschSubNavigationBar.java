package com.bosch.app.lib.widget;

import android.content.Context;
import androidx.viewpager.widget.ViewPager;
import android.util.AttributeSet;

import com.bosch.app.lib.R;
import com.bosch.app.lib.adapter.BoschNavigationBarAdapter;

import java.util.ArrayList;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 05.12.17.
 */

/**
 * Always use {@link R.style#Widget_Bosch_SubNavigationBar} in xml declaration
 * Needs to be used together with {@link BoschNavigationBarAdapter}
 * <p>
 * Call {@link #setupWithViewPager(ViewPager)} to link your viewpager with this sub navigation bar
 * <p>
 * <p>
 * Definition:
 * The Sub Navigation Bar consists of several tabs that structure the content within a top level view.
 * It is located below the app header.
 * Each tab provides the affordance for displaying grouped content and allows easy switching between different views, data sets,
 * or functional aspects.
 * <p>
 * Usage:
 * The Sub Navigation Bar should be used whenever an additional navigation hierarchy is needed to structure the content of a view.
 * It can be used as a supplement to either the Bottom Navigation, or the Side Navigation.
 * It is not designed to substitute one of those two top level navigation patterns!
 * <p>
 * Please note:
 * As swipe gestures are used for navigating between tabs, The Sub Navigation Bar should never be paired with content that requires swiping.
 */
public class BoschSubNavigationBar extends BoschNavigationBar {

    public BoschSubNavigationBar(Context context) {
        super(context);
    }

    public BoschSubNavigationBar(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public BoschSubNavigationBar(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    /**
     * Is called from {@link #setupWithViewPager(ViewPager)}
     *
     * @param items list of items in tabs
     */
    @Override
    protected void createTabs(final ArrayList<BoschNavigationBarAdapter.BoschNavigationBarItem> items) {
        if (items != null) {
            setupTabs(items, R.layout.bosch_navigation_bar_sub_item);
        }
    }

    @Override
    protected void updateGravityMode(final boolean makeScrollable) {
        if (makeScrollable) {
            setTabGravity(GRAVITY_FILL);
            setTabMode(MODE_SCROLLABLE);
            addTabStartAndEndPadding();
        } else {
            setTabGravity(GRAVITY_FILL);
            setTabMode(MODE_FIXED);
        }
    }
}
