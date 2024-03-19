package com.bosch.app.lib.widget;

import android.content.Context;
import android.content.res.Resources;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.google.android.material.tabs.TabLayout;
import androidx.viewpager.widget.PagerAdapter;
import androidx.viewpager.widget.ViewPager;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.bosch.app.lib.R;
import com.bosch.app.lib.adapter.BoschNavigationBarAdapter;

import java.util.ArrayList;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 14.12.17.
 */

/**
 * Abstract class for {@link BoschSubNavigationBar} and {@link BoschBottomNavigationBar}
 * <p>
 * This class is used to create tabs, layout etc.
 */
abstract class BoschNavigationBar extends TabLayout {

    private LayoutInflater mLayoutInflater;
    private float mTabPadding;
    private float mTabLayoutHeight;

    public BoschNavigationBar(Context context) {
        super(context);
        init(context);
    }

    public BoschNavigationBar(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public BoschNavigationBar(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    private void init(final Context context) {
        this.mLayoutInflater = LayoutInflater.from(context);
        final Resources res = context.getResources();
        if (res != null) {
            this.mTabPadding = res.getDimension(R.dimen.gu6);
            this.mTabLayoutHeight = res.getDimension(R.dimen.gu8);
        }
    }

    /**
     * connects {@link BoschBottomNavigationBar} or {@link BoschSubNavigationBar} with viewpager
     *
     * @param viewPager
     */
    @Override
    public void setupWithViewPager(@Nullable final ViewPager viewPager) {
        super.setupWithViewPager(viewPager);
        if (viewPager != null) {
            final PagerAdapter adapter = viewPager.getAdapter();
            if (adapter instanceof BoschNavigationBarAdapter) {
                createTabs(((BoschNavigationBarAdapter) adapter).getNavigationItems());
            }
            addOnTabSelectedListener(new TabLayout.ViewPagerOnTabSelectedListener(viewPager) {
                @Override
                public void onTabSelected(TabLayout.Tab tab) {
                    final int current = viewPager.getCurrentItem();
                    final int newTab = tab.getPosition();
                    final boolean smoothScroll = Math.abs(current - newTab) <= 2;
                    viewPager.setCurrentItem(newTab, smoothScroll);
                }
            });
        }
    }

    protected abstract void createTabs(final ArrayList<BoschNavigationBarAdapter.BoschNavigationBarItem> items);

    /**
     * sets custom view to all tabs
     *
     * @param items       list of items
     * @param tabLayoutId id of layout resource
     */
    protected void setupTabs(@NonNull final ArrayList<BoschNavigationBarAdapter.BoschNavigationBarItem> items, final int tabLayoutId) {
        if (this.mLayoutInflater != null) {
            LinearLayout tabLayout;
            BoschImageView tabIcon;
            TextView tabText;
            for (BoschNavigationBarAdapter.BoschNavigationBarItem item : items) {
                tabLayout = (LinearLayout) this.mLayoutInflater.inflate(tabLayoutId, null);
                if (tabLayout != null) {
                    tabIcon = (BoschImageView) tabLayout.findViewById(R.id.tabIcon);
                    tabText = (TextView) tabLayout.findViewById(R.id.tabText);
                    if (tabIcon != null && tabText != null && tabLayout != null) {
                        if (item.getIcon() != -1) {
                            tabIcon.setImageResource(item.getIcon());
                        } else {
                            final int textPadding = tabLayout.getPaddingRight();
                            tabLayout.setPadding(textPadding, 0, textPadding, 0);
                            tabIcon.setVisibility(GONE);
                        }
                        if (!TextUtils.isEmpty(item.getTitle())) {
                            tabText.setText(item.getTitle());
                        } else {
                            final int iconPadding = tabLayout.getPaddingLeft();
                            tabLayout.setPadding(iconPadding, 0, iconPadding, 0);
                            tabIcon.setPadding(0, 0, 0, 0);
                            tabText.setVisibility(GONE);
                        }
                        final TabLayout.Tab tabMood = getTabAt(items.indexOf(item));
                        if (tabMood != null) {
                            tabMood.setCustomView(tabLayout);
                            Log.i("test", "test");
                        }
                    }
                }
            }
        }
    }

    /**
     * Adds padding before first and after last tab (Only when scrollable)
     */
    protected void addTabStartAndEndPadding() {
        final View tabOne = getChildAt(0);
        if (tabOne != null) {
            tabOne.setPadding((int) this.mTabPadding, 0, (int) this.mTabPadding, 0);
        }
    }

    protected abstract void updateGravityMode(final boolean makeScrollable);

    /**
     * sets height of tabs
     * calculates width of every tab, when one tab is larger than average width (screenWidth / tabCount) make the tabs scrollable
     *
     * @param widthMeasureSpec
     * @param heightMeasureSpec
     */
    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        final int tabCount = getTabCount();
        if (tabCount > 0) {
            View tabView;
            boolean makeScrollable = false;
            final int tabWidth = MeasureSpec.getSize(widthMeasureSpec) / tabCount;
            for (int i = 0; i < tabCount; i++) {
                tabView = getTabAt(i).getCustomView();
                if (tabView != null) {
                    tabView.measure(ViewPager.LayoutParams.WRAP_CONTENT, ViewPager.LayoutParams.MATCH_PARENT);
                    if (tabView.getMeasuredWidth() > tabWidth) {
                        makeScrollable = true;
                        break;
                    }
                }
            }
            updateGravityMode(makeScrollable);
        }
        final int heightMode = MeasureSpec.getMode(heightMeasureSpec);
        if (heightMode == MeasureSpec.AT_MOST || heightMode == MeasureSpec.UNSPECIFIED) {
            final int height = MeasureSpec.makeMeasureSpec((int) this.mTabLayoutHeight, MeasureSpec.EXACTLY);
            super.onMeasure(widthMeasureSpec, height);
        } else {
            super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        }
    }

    /**
     * Is needed for e.g. orientation changes
     * {@link OnTabSelectedListener#onTabReselected(Tab)} gets called when listener is set
     * after every orientation change
     *
     * @param changed
     * @param l
     * @param t
     * @param r
     * @param b
     */
    @Override
    protected void onLayout(final boolean changed, final int l, final int t, final int r, final int b) {
        super.onLayout(changed, l, t, r, b);
        if (changed) {
            getTabAt(getSelectedTabPosition()).select();
        }
    }
}
