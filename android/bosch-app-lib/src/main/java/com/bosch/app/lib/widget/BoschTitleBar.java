package com.bosch.app.lib.widget;

import android.content.Context;
import android.content.res.ColorStateList;
import android.graphics.drawable.Drawable;
import com.google.android.material.appbar.AppBarLayout;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.drawable.DrawableCompat;
import android.util.AttributeSet;
import android.view.Menu;
import android.view.MenuItem;

import com.bosch.app.lib.R;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 27.11.17.
 */

/**
 * Can be used without specific style declaration in xml
 * <p>
 * Definition:
 * The title bar is a defined space of an app providing orientation throughout the app.
 * Optionally, it contains navigation options and high level features.
 * It appears at the top of any screen, below the status bar.
 * The title reflects the current page, e.g app title, page title, sub page title, or page filter.
 * <p>
 * Usage:
 * In general, the title bar should be used in any app and on any screen.
 * If there is a Side Navigation used in an app (see also the design principles for Navigation),
 * there is a menu icon positioned in the left corner, which opens the side navigation panel.
 * In case of a Bottom Navigation, the icon is not part of the title bar.
 * As part of both navigation patterns, an arrow icon indicates sub pages and allows a hierarchical back navigation to a main page.
 * <p>
 * Optionally, there are additional icons on the right side that provide access to actions on overall app level, e.g the app search.
 * <p>
 * Public view methods:
 * {@link #tintMenuIcons(Menu)}
 */
public class BoschTitleBar extends AppBarLayout {

    public BoschTitleBar(Context context) {
        super(context);
        init(context);
    }

    public BoschTitleBar(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    private void init(final Context context) {
        inflate(context, R.layout.bosch_app_header, this);
    }

    /**
     * Tints the icons
     *
     * @param menu which is created to display menu icons on toolbar
     */
    public void tintMenuIcons(final Menu menu) {
        if (menu != null) {
            final int size = menu.size();
            final ColorStateList colorStateList = ContextCompat.getColorStateList(getContext(), R.color.bosch_title_bar_icon_color);
            for (int i = 0; i < size; i++) {
                final MenuItem item = menu.getItem(i);
                final Drawable icon = item.getIcon();
                DrawableCompat.setTintList(icon, colorStateList);
            }
        }
    }
}
