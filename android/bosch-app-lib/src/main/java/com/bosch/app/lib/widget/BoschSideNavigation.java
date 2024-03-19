package com.bosch.app.lib.widget;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.res.ColorStateList;
import android.content.res.Resources;
import android.content.res.TypedArray;
import android.graphics.Color;
import com.google.android.material.navigation.NavigationView;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.drawerlayout.widget.DrawerLayout.DrawerListener;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.bosch.app.lib.R;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 06.12.17.
 */

/**
 * Should always be used within a {@link DrawerLayout}
 * <p>
 * Always use {@link R.style#Widget_Bosch_SideNavigation} in xml declaration
 * <p>
 * Definition:
 * The Side Navigation provides access to the top level views of an app and is designed as an overlay panel that is only visible on demand.
 * It is accessible from a menu icon on the upper left corner of each main view.
 * It is recommended to use not more than 6-8 menu points to avoid the need of scrolling within the panel.
 * <p>
 * Usage:
 * Usage
 * It is recommended to use a Side Navigation
 * <p>
 * - When the information architecture contains more than 5 top level views
 * - When top level views are not equally important and may include infrequent destinations
 * - When the information architecture is complex and requires several navigation layers
 * - When functionalities, controls or views would be affected by a fixed bottom bar
 * <p>
 * As the Side Navigation is only visible when needed, it helps to sustain visual simplicity within your app.
 * On the downside, switching between views requires more "clicks" compared to the Bottom Navigation
 * and takes more time due to transitions that are needed to show or hide the overlay.
 * <p>
 * View Attributes:
 * {@link R.styleable#BoschSideNavigation_boschStyle}
 * - Defines the background and text color
 * <p>
 * {@link R.styleable#BoschSideNavigation_title}
 * - Sets the title
 * <p>
 * {@link R.styleable#BoschSideNavigation_subTitle}
 * - Sets the subtitle
 * <p>
 * Public view methods:
 * {@link #setTitle(int)}
 * <p>
 * {@link #setTitle(String)}
 * <p>
 * {@link #setSubTitle(int)}
 * <p>
 * {@link #setSubTitle(String)}
 * <p>
 */
public class BoschSideNavigation extends NavigationView implements View.OnClickListener, DrawerListener,
        View.OnLayoutChangeListener {

    private DrawerLayout mDrawerLayout;
    private LinearLayout mHeaderLayout;
    private boolean mDrawerIsOpen;
    private BoschImageView mClose;
    private TextView mTitle;
    private TextView mSubtitle;

    private BoschBlurWidget mBlurUtil;

    public BoschSideNavigation(Context context) {
        super(context);
        init(context, null);
    }

    public BoschSideNavigation(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    public BoschSideNavigation(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }

    private void init(final Context context, AttributeSet attrs) {
        this.mHeaderLayout = (LinearLayout) LayoutInflater.from(context).inflate(R.layout.bosch_side_navigation_header, this, false);
        this.mClose = (BoschImageView) this.mHeaderLayout.findViewById(R.id.side_navigation_close);
        this.mClose.setOnClickListener(this);
        this.mTitle = this.mHeaderLayout.findViewById(R.id.side_navigation_title);
        this.mSubtitle = this.mHeaderLayout.findViewById(R.id.side_navigation_subtitle);
        addHeaderView(this.mHeaderLayout);

        int background = -1;
        if (attrs != null) {
            final TypedArray a = context.getTheme().obtainStyledAttributes(
                    attrs,
                    R.styleable.BoschSideNavigation,
                    0, 0);
            try {
                background = a.getInt(R.styleable.BoschSideNavigation_boschStyle, 0);

                setTitle(a.getString(R.styleable.BoschSideNavigation_title));
                setSubTitle(a.getString(R.styleable.BoschSideNavigation_subTitle));

            } finally {
                a.recycle();
            }
        }
        setBackground(background);
        this.mBlurUtil = new BoschBlurWidget(context);
    }

    /**
     * after view was attached to window, try to get views parent
     * {@link #getParent()} needs to be a {@link DrawerLayout} otherwise
     * features like blur effect behind menu won't work!
     */
    @SuppressLint("RestrictedApi")
    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        if (getParent() instanceof DrawerLayout) {
            this.mDrawerLayout = (DrawerLayout) getParent();
            this.mDrawerLayout.addDrawerListener(this);
            this.mDrawerLayout.setScrimColor(Color.TRANSPARENT);
            this.mDrawerLayout.setDrawerElevation(1);
            this.mDrawerLayout.addOnLayoutChangeListener(this);
        }
    }

    /**
     * Sets menu background depending on {@link R.styleable#BoschSideNavigation_boschStyle}
     *
     * @param backgroundId
     */
    private void setBackground(int backgroundId) {
        boolean light = false;
        switch (backgroundId) {
            case 0:
                //Light
                setBackgroundResource(R.color.boschWhite);
                light = true;
                break;
            case 1:
                //Dark
                setBackgroundResource(R.color.boschDarkGray);
                break;
            case 2:
                //SolidFuchsia
                setBackgroundResource(R.color.boschFuchsia);
                break;
            case 3:
                //SolidLightgreen
                setBackgroundResource(R.color.boschLightGreen);
                break;
            case 4:
                //SolidDarkgreen
                setBackgroundResource(R.color.boschDarkGreen);
                break;
            case 5:
                //SolidTurquoise
                setBackgroundResource(R.color.boschTurquoise);
                break;
            case 6:
                //SolidDarkblue
                setBackgroundResource(R.color.boschDarkBlue);
                break;
            case 7:
                //SolidViolet
                setBackgroundResource(R.color.boschViolet);
                break;
            case 8:
                //SolidLightblue
                setBackgroundResource(R.color.boschLightBlue);
                break;
            case 9:
                //GradientFuchsiaViolet
                setBackgroundResource(R.drawable.bosch_side_navigation_gradient_fuchsia_violet);
                break;
            case 10:
                //GradientVioletDarkblue
                setBackgroundResource(R.drawable.bosch_side_navigation_gradient_violet_darkblue);
                break;
            case 11:
                //GradientDarkblueLightblue
                setBackgroundResource(R.drawable.bosch_side_navigation_gradient_darkblue_lighblue);
                break;
            case 12:
                //GradientLightblueTurquoise
                setBackgroundResource(R.drawable.bosch_side_navigation_gradient_lightblue_turquoise);
                break;
            case 13:
                //GradientTurquoiseLightgreen
                setBackgroundResource(R.drawable.bosch_side_navigation_gradient_turquoise_lightgreen);
                break;
            case 14:
                //GradientLightgreenDarkgreen
                setBackgroundResource(R.drawable.bosch_side_navigation_gradient_lightgreen_darkgreen);
                break;
            default:
                setBackgroundResource(R.color.boschWhite);
        }
        updateTextColor(light);
    }

    /**
     * Updates text color of slide in menu
     *
     * @param light = true ? color of text is black : color is white
     *              creates {@link ColorStateList} for touch effects on menu items
     */
    private void updateTextColor(boolean light) {
        final Context context = getContext();
        if (context != null) {
            final Resources res = context.getResources();
            if (res != null) {
                final int color;
                if (light) {
                    color = res.getColor(R.color.boschBlack);
                } else {
                    color = res.getColor(R.color.boschWhite);
                }
                final int disabled = res.getColor(R.color.boschLightGrayB25);
                final int pressed = res.getColor(R.color.boschLightBlue);
                final ColorStateList colorStateList = new ColorStateList(new int[][]{
                        new int[]{-android.R.attr.state_enabled},
                        new int[]{android.R.attr.state_pressed},
                        new int[]{}
                }, new int[]{disabled, pressed, color});
                if (this.mTitle != null && mClose != null && mSubtitle != null) {
                    this.mTitle.setTextColor(color);
                    this.mClose.setImageTintList(colorStateList);
                    this.mSubtitle.setTextColor(color);
                }
                setItemIconTintList(colorStateList);
                setItemTextColor(colorStateList);
            }
        }
    }

    /**
     * Set the title
     *
     * @param id
     */
    public void setTitle(final int id) {
        if (this.mTitle != null) {
            this.mTitle.setText(id);
        }
    }

    /**
     * Set the title
     *
     * @param title
     */
    public void setTitle(final String title) {
        if (this.mTitle != null && !TextUtils.isEmpty(title)) {
            this.mTitle.setText(title);
        }
    }

    /**
     * Set the subtitle
     *
     * @param id
     */
    public void setSubTitle(final int id) {
        if (this.mSubtitle != null) {
            this.mSubtitle.setText(id);
        }
    }

    /**
     * Set the subtitle
     *
     * @param subtitle
     */
    public void setSubTitle(final String subtitle) {
        if (this.mSubtitle != null && !TextUtils.isEmpty(subtitle)) {
            this.mSubtitle.setText(subtitle);
        }
    }

    @Override
    public void onClick(View v) {
        if (v == mClose) {
            if (this.mDrawerLayout != null) {
                this.mDrawerLayout.closeDrawers();
            }

        }
    }

    /**
     * Show blurView when drawer is opened, for nice fade in effect set alpha = {@param slideOffset}
     *
     * @param drawerView
     * @param slideOffset
     */
    @Override
    public void onDrawerSlide(View drawerView, float slideOffset) {
        if (this.mBlurUtil != null) {
            if (!this.mDrawerIsOpen) {
                this.mDrawerIsOpen = true;
                this.mBlurUtil.show();
            }
            this.mBlurUtil.setAlpha(slideOffset);
        }
        if (slideOffset == 0) {
            onDrawerClosed(drawerView);
        }
    }

    @Override
    public void onDrawerOpened(View drawerView) {
        Log.i("Drawer", "Open");
    }

    /**
     * Hide BlurView when Slide in Menu is closed
     *
     * @param drawerView
     */
    @Override
    public void onDrawerClosed(View drawerView) {
        // closing drawer
        if (this.mBlurUtil != null) {
            this.mBlurUtil.hideBlur(this);
        }
        this.mDrawerIsOpen = false;
    }

    @Override
    public void onDrawerStateChanged(int newState) {
    }

    /**
     * Prepares BlurView so user doesn't recognize any ui delays or lags
     */
    @Override
    public void onLayoutChange(View v, int left, int top, int right, int bottom, int oldLeft, int oldTop, int oldRight, int oldBottom) {
        if (this.mDrawerLayout != null && this.mBlurUtil != null) {
            if (this.mDrawerLayout.getDrawerLockMode(Gravity.LEFT) != DrawerLayout.LOCK_MODE_LOCKED_CLOSED
                    && !this.mDrawerIsOpen) {
                this.mBlurUtil.prepareBlur(v);
            }
        }
    }
}
