package com.bosch.app.lib.widget;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.Point;
import android.graphics.Rect;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.Display;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.PopupWindow;

import com.bosch.app.lib.R;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 07.12.17.
 */

/**
 * Public view methods:
 * {@link #BoschPopover(View, View)}
 * <p>
 * {@link #show()}
 * <p>
 * {@link #getContentView()}
 * <p>
 * {@link #showArrow(boolean)}
 * <p>
 * {@link #setMaxWidth(int)}
 * <p>
 * {@link #setTitle(int)}
 * <p>
 * {@link #setTitle(String)}
 */

public class BoschPopover extends PopupWindow implements View.OnTouchListener, View.OnClickListener, View.OnLayoutChangeListener {

    private static int ALPHA_DELAY = 400;
    private View mAnchor;
    private FrameLayout mRoot;
    private ImageView mArrowUp;
    private ImageView mArrowDown;
    private ImageView mArrowLeft;
    private ImageView mArrowRight;
    private BoschLabel mHeadline;
    private ImageView mClose;
    private LayoutInflater mInflater;
    private Context mContext;

    private Rect mAnchorRect;
    private int mScreenWidth;
    private int mScreenHeight;

    private View mContentView;
    private FrameLayout mPopoverContent;
    private boolean mShowArrow;
    private int mMargin;
    private int mMaxWidth = -1;

    private Handler debounceHandler;
    private Runnable debounceRunnable;

    /**
     * Constructor
     *
     * @param anchor  anchor view where tooltip should be shown
     * @param content view which should be displayed with this popover
     */
    public BoschPopover(final View anchor, final View content) {
        super(anchor);
        this.mAnchor = anchor;
        this.mContentView = content;

        init();
    }

    protected void init() {
        if (this.mAnchor != null) {
            this.mContext = mAnchor.getContext();
            if (mContext != null) {
                this.mInflater = (LayoutInflater) LayoutInflater.from(this.mContext);

                this.mRoot = (FrameLayout) this.mInflater.inflate(R.layout.bosch_popover, null);
                this.mArrowDown = (ImageView) this.mRoot.findViewById(R.id.arrow_down);
                this.mArrowUp = (ImageView) this.mRoot.findViewById(R.id.arrow_up);
                this.mArrowLeft = (ImageView) this.mRoot.findViewById(R.id.arrow_left);
                this.mArrowRight = (ImageView) this.mRoot.findViewById(R.id.arrow_right);
                this.mShowArrow = true;
                this.mPopoverContent = this.mRoot.findViewById(R.id.popover_content);
                if (this.mPopoverContent != null) {
                    this.mPopoverContent.addView(this.mContentView);
                }
                this.mHeadline = this.mRoot.findViewById(R.id.popover_title);
                this.mHeadline.setVisibility(View.INVISIBLE);
                this.mClose = this.mRoot.findViewById(R.id.popover_close);
                if (this.mClose != null) {
                    this.mClose.setOnClickListener(this);
                }
                setTouchInterceptor(this);

                setWidth(LinearLayout.LayoutParams.WRAP_CONTENT);
                setHeight(LinearLayout.LayoutParams.WRAP_CONTENT);
                setTouchable(true);
                setFocusable(true);
                setOutsideTouchable(true);

                this.mRoot.addOnLayoutChangeListener(this);
                setContentView(this.mRoot);

                final Resources res = this.mContext.getResources();
                if (res != null) {
                    mMargin = (int) res.getDimension(R.dimen.gu2);
                }
            }
        }
    }

    /**
     * Calculates the anchor position to define where popover and his arrow should be displayed
     */
    private void calculatePositionOfAnchor() {
        if (this.mAnchor != null && this.mContext != null) {
            //calculate position of anchor on screen
            final int[] location = new int[2];
            this.mAnchor.getLocationOnScreen(location);
            this.mAnchorRect = new Rect(location[0], location[1], location[0] + this.mAnchor.getWidth(), location[1]
                    + this.mAnchor.getHeight());

            WindowManager wm = (WindowManager) this.mContext.getSystemService(Context.WINDOW_SERVICE);
            Display display = wm.getDefaultDisplay();
            Point size = new Point();
            display.getSize(size);

            this.mScreenWidth = size.x;
            this.mScreenHeight = size.y;
        }
    }

    /**
     * After popover layout was created, the popover can finally be updated and positioned on the right x and y coords
     *
     * @param viewWidth  width of popover layout
     * @param viewHeight height of popover layout
     */
    private void updatePopover(final int viewWidth, final int viewHeight) {
        calculatePositionOfAnchor();
        final int anchorHeight = this.mAnchorRect.height();
        final int anchorWidth = this.mAnchorRect.width();
        final int anchorLeft = this.mAnchorRect.left;
        final int anchorTop = this.mAnchorRect.top;
        final int anchorRight = this.mAnchorRect.right;
        final int anchorBottom = this.mAnchorRect.bottom;
        final int anchorCenterX = this.mAnchorRect.centerX();
        final int anchorCenterY = this.mAnchorRect.centerY();
        final int screenCenterX = this.mScreenWidth / 2;
        final int screenCenterY = this.mScreenHeight / 2;

        final int popoverTop = 0;
        final int popoverBottom = viewHeight;
        final int popoverLeft = 0;
        final int popoverRight = viewWidth;
        final int popoverWidth;

        final int arrowWidth = !this.mShowArrow ? 0 : this.mArrowDown.getWidth();
        final int arrowHeight = !this.mShowArrow ? 0 : this.mArrowRight.getHeight();
        int offsetX = 0;
        int offsetY = 0;
        int arrowPosition;
        int arrowId = -1;
        //Y Center of screen
        if (anchorCenterY < screenCenterY + anchorHeight && anchorCenterY > screenCenterY - anchorHeight) {
            //Left or Right
            if (anchorCenterX > screenCenterX) {
                //show popover left
                offsetX = getOffset(anchorLeft, popoverRight);
                arrowId = R.id.arrow_right;
                popoverWidth = mMaxWidth > 0 ? mMaxWidth : anchorLeft;
            } else {
                //show popover right
                offsetX = getOffset(anchorRight, popoverLeft);
                arrowId = R.id.arrow_left;
                popoverWidth = mMaxWidth > 0 ? mMaxWidth : this.mScreenWidth - anchorRight;
            }
            if (anchorCenterY > screenCenterY) {
                //anchor bottom
                offsetY = getOffset(anchorCenterY, popoverTop + popoverBottom / 2);
            } else {
                //anchor top
                offsetY = getOffset(anchorCenterY, popoverTop + popoverBottom / 2);
            }
            arrowPosition = anchorCenterY - popoverTop - offsetY - arrowHeight / 2;
        }
        //Bottom / Top of screen
        else {
            if (anchorCenterY > screenCenterY) {
                //anchor bottom
                offsetY = getOffset(anchorTop, popoverBottom);
                arrowId = R.id.arrow_down;
            } else {
                //anchor top
                arrowId = R.id.arrow_up;
                offsetY = getOffset(anchorBottom, popoverTop);
            }
            if (anchorCenterX > screenCenterX) {
                //Anchor right
                offsetX = getOffset(anchorRight, popoverRight - this.mMargin);
                final int newRight = popoverRight + offsetX;
                final int offsetRight = newRight > this.mScreenWidth ? newRight - this.mScreenWidth : 0;
                arrowPosition = popoverRight - (this.mMargin - offsetRight) - (anchorRight - anchorCenterX) - arrowWidth / 2;
            } else {
                //anchor left
                offsetX = getOffset(anchorLeft, popoverLeft + this.mMargin);
                arrowPosition = anchorCenterX - popoverLeft - offsetX - arrowWidth;
                offsetX -= this.mMargin;
            }
            popoverWidth = this.mScreenWidth;
        }
        showPopoverPointer(arrowId, arrowPosition);
        update(offsetX, offsetY, popoverWidth, LinearLayout.LayoutParams.WRAP_CONTENT, true);
        this.makeVisible();
    }

    /**
     * calculates the offset to move the popover to the right position
     *
     * @param anchor  coordinates (x or y center)
     * @param popover popover coordinates (bottom, top, right, left or center) depends on anchor position
     * @return
     */
    private int getOffset(final int anchor, final int popover) {
        return anchor - popover;
    }

    /**
     * shows the popover arrow on top, right, bottom or left
     *
     * @param arrowId
     * @param position x / y position of arrow
     */
    private void showPopoverPointer(final int arrowId, final int position) {
        if (mArrowDown != null && mArrowUp != null && mArrowLeft != null && mArrowRight != null) {
            if (this.mShowArrow) {
                if (arrowId == R.id.arrow_up) {
                    this.mArrowUp.setVisibility(View.VISIBLE);
                    this.mArrowUp.setX(position);

                    this.mArrowRight.setVisibility(View.GONE);
                    this.mArrowLeft.setVisibility(View.GONE);
                    this.mArrowDown.setVisibility(View.GONE);
                } else if (arrowId == R.id.arrow_left) {
                    this.mArrowLeft.setVisibility(View.VISIBLE);
                    this.mArrowLeft.setY(position);

                    this.mArrowRight.setVisibility(View.GONE);
                    this.mArrowUp.setVisibility(View.GONE);
                    this.mArrowDown.setVisibility(View.GONE);
                } else if (arrowId == R.id.arrow_right) {
                    this.mArrowRight.setVisibility(View.VISIBLE);
                    this.mArrowRight.setY(position);

                    this.mArrowUp.setVisibility(View.GONE);
                    this.mArrowLeft.setVisibility(View.GONE);
                    this.mArrowDown.setVisibility(View.GONE);
                } else if (arrowId == R.id.arrow_down) {
                    this.mArrowDown.setVisibility(View.VISIBLE);
                    this.mArrowDown.setX(position);

                    this.mArrowRight.setVisibility(View.GONE);
                    this.mArrowLeft.setVisibility(View.GONE);
                    this.mArrowUp.setVisibility(View.GONE);
                } else {
                    this.mArrowLeft.setVisibility(View.GONE);
                    this.mArrowRight.setVisibility(View.GONE);
                    this.mArrowUp.setVisibility(View.GONE);
                    this.mArrowDown.setVisibility(View.GONE);
                }
            } else {
                this.mArrowLeft.setVisibility(View.GONE);
                this.mArrowRight.setVisibility(View.GONE);
                this.mArrowUp.setVisibility(View.GONE);
                this.mArrowDown.setVisibility(View.GONE);
            }
        }
    }

    @Override
    public boolean onTouch(View v, MotionEvent event) {
        if (event.getAction() == MotionEvent.ACTION_OUTSIDE) {
            dismiss();
            return true;
        }
        return false;
    }

    @Override
    public void onClick(View v) {
        if (v == mClose) {
            dismiss();
        }
    }

    @Override
    public void onLayoutChange(View v, int left, int top, int right, int bottom, int oldLeft, int oldTop, int oldRight, int oldBottom) {
        updatePopover(right, bottom);
    }

    /**
     * @return the content view
     */
    public View getContentView() {
        return this.mContentView;
    }

    /**
     * Defines if the tooltip arrow should be displayed
     *
     * @param showArrow
     */
    public void showArrow(final boolean showArrow) {
        this.mShowArrow = showArrow;
    }

    /**
     * Show popup window. Popup is automatically positioned, on top or bottom of anchor view.
     */
    public void show() {
        this.mRoot.setAlpha(0);
        showAtLocation(this.mAnchor, Gravity.NO_GRAVITY, 0, 0);
    }

    /**
     * Maximum width of popup window in pixel
     *
     * @param width
     */
    public void setMaxWidth(int width) {
        this.mMaxWidth = width;
    }

    /**
     * Sets the popover title from Resources
     *
     * @param title
     */
    public void setTitle(final int title) {
        if (this.mHeadline != null && getContentView() != null && getContentView().getContext() != null) {
            this.mHeadline.setText(getContentView().getContext().getString(title));
        }
    }

    /**
     * Sets the popover title, call this method with null parameter to hide title
     *
     * @param title
     */
    public void setTitle(final String title) {
        if (this.mHeadline != null) {
            if (title != null) {
                this.mHeadline.setVisibility(View.VISIBLE);
                this.mHeadline.setText(title);
            } else {
                this.mHeadline.setVisibility(View.INVISIBLE);
            }
        }
    }

    private void makeVisible() {
        if (this.debounceHandler == null) {
            this.debounceHandler = new Handler(Looper.getMainLooper());
        }
        this.debounceHandler.removeCallbacks(debounceRunnable);
        this.debounceRunnable = new Runnable() {
            @Override
            public void run() {
                if (BoschPopover.this.mRoot != null) {
                    BoschPopover.this.mRoot.animate().setDuration(250).alpha(1).start();
                }
            }
        };
        this.debounceHandler.postDelayed(this.debounceRunnable, ALPHA_DELAY);
    }
}