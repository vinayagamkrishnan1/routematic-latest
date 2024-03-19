package com.bosch.app.lib.widget;

import android.content.Context;
import androidx.annotation.Nullable;
import com.google.android.material.tabs.TabLayout;
import androidx.viewpager.widget.ViewPager;
import android.util.AttributeSet;

import com.bosch.app.lib.R;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 16.11.17.
 */

/**
 * Needs to be used together with a {@link ViewPager}
 * <p>
 * Always use {@link R.style#Widget_Bosch_PageIndicator} in xml declaration
 * <p>
 * Definition:
 * The Page Indicator is an abstract representation of the existing pages and shows on which page the user is located.
 * In addition, the Page Indicator sometimes offers the possibility to use it as an interactive element
 * and to switch to the corresponding page by clicking on one of the points.
 */
public class BoschPageIndicator extends TabLayout {

    public BoschPageIndicator(Context context) {
        super(context);
    }

    public BoschPageIndicator(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
    }

    public BoschPageIndicator(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    @Override
    public void setupWithViewPager(@Nullable ViewPager viewPager) {
        super.setupWithViewPager(viewPager);
    }
}
