package com.bosch.app.lib.adapter;

import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentStatePagerAdapter;

import com.bosch.app.lib.widget.BoschBottomNavigationBar;
import com.bosch.app.lib.widget.BoschSubNavigationBar;

import java.util.ArrayList;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 14.12.17.
 */

/**
 * Adapter for {@link BoschBottomNavigationBar} or {@link BoschSubNavigationBar}
 * Needs {@link BoschNavigationBarItem}
 */
public class BoschNavigationBarAdapter extends FragmentStatePagerAdapter {
    private ArrayList<BoschNavigationBarItem> mNavigationItems;

    public BoschNavigationBarAdapter(FragmentManager fm, ArrayList<BoschNavigationBarItem> items) {
        super(fm);
        this.mNavigationItems = items;
    }

    public ArrayList<BoschNavigationBarItem> getNavigationItems() {
        return mNavigationItems;
    }

    @Override
    public Fragment getItem(int position) {
        if (mNavigationItems != null) {
            return this.mNavigationItems.get(position).getFragment();
        }
        return null;
    }

    @Override
    public int getCount() {
        if (mNavigationItems != null) {
            return this.mNavigationItems.size();
        }
        return 0;
    }

    @Override
    public CharSequence getPageTitle(int position) {
        if (mNavigationItems != null) {
            return this.mNavigationItems.get(position).getTitle();
        }
        return null;
    }

    public int getPageIcon(int position) {
        if (mNavigationItems != null) {
            return this.mNavigationItems.get(position).getIcon();
        }
        return -1;
    }

    /**
     * Interface which must be implemented in your item model
     * Holds an instance of the Fragment, the title and the icon which should be displayed in the nav bar
     * <p>
     * getFragment() is not allowed to return null
     * <p>
     * getTitle() can be null or empty when not text should be displayed
     * <p>
     * getIcon() should be -1 when no icon should be displayed
     */
    public interface BoschNavigationBarItem {

        Fragment getFragment();

        String getTitle();

        int getIcon();
    }

}
