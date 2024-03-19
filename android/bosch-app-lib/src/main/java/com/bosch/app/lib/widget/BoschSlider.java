
package com.bosch.app.lib.widget;

import android.content.Context;
import android.content.res.Resources;
import android.content.res.TypedArray;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.Typeface;
import androidx.core.content.res.ResourcesCompat;
import androidx.appcompat.widget.AppCompatSeekBar;
import android.util.AttributeSet;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;

import com.bosch.app.lib.R;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 24.11.17.
 */

/**
 * Always use {@link R.style#Widget_Bosch_Slider} in xml declaration
 *
 * View Attributes:
 * {@link R.styleable#BoschSlider_vertical}
 * - True if slider orientation should be vertical
 * <p>
 * {@link R.styleable#BoschSlider_showLabel}
 * - True if slider should show a label while dragging
 * <p>
 * {@link R.styleable#BoschSlider_enabled}
 * - True if slider is enabled
 */

public class BoschSlider extends AppCompatSeekBar {

    private static final int ROTATION_ANGLE = -90;
    //Attributes which come from xml
    private final boolean mIsVertical;
    private final boolean mShowLabel;
    private int mStartProgress;

    private Paint mPaint;
    private Rect mRect;
    private Rect mLabelRect;
    private float mLabelPadding;
    private int mLabelColor;
    private int mLabelTextColor;
    private float mLabelTextSize;
    private Typeface mTypeFace;

    private OnSeekBarChangeListener mOnSeekBarChangeListener;

    public BoschSlider(final Context context) {
        super(context);
        this.mIsVertical = false;
        this.mShowLabel = false;
        init(context);
    }

    public BoschSlider(final Context context, final AttributeSet attrs) {
        this(context, attrs, R.attr.seekBarStyle);
    }

    public BoschSlider(final Context context, final AttributeSet attrs, final int defStyle) {
        super(context, attrs, defStyle);
        TypedArray a = context.getTheme().obtainStyledAttributes(
                attrs,
                R.styleable.BoschSlider,
                0, 0);
        final boolean isEnabled;
        try {
            this.mIsVertical = a.getBoolean(R.styleable.BoschSlider_vertical, false);
            this.mShowLabel = a.getBoolean(R.styleable.BoschSlider_showLabel, false);
            isEnabled = a.getBoolean(R.styleable.BoschSlider_enabled, true);
        } finally {
            a.recycle();
        }

        setEnabled(isEnabled);
        init(context);

    }

    private void init(final Context context) {
        this.mPaint = new Paint();
        this.mRect = new Rect();
        this.mLabelRect = new Rect();
        final Resources res = getResources();
        if (res != null) {
            this.mLabelPadding = res.getDimension(R.dimen.gu0_75);
            this.mLabelTextSize = res.getDimension(R.dimen.text_gu1_5);
            this.mLabelColor = res.getColor(R.color.boschLightBlue);
            this.mLabelTextColor = res.getColor(R.color.boschWhite);
            this.mTypeFace = ResourcesCompat.getFont(context, R.font.bosch_sans_regular);
        }
    }

    /**
     * changes size of layout according to 90° rotation
     * @param width
     * @param height
     * @param oldWidth
     * @param oldHeight
     */
    @Override
    protected final void onSizeChanged(final int width, final int height, final int oldWidth, final int oldHeight) {
        if (this.mIsVertical) {
            super.onSizeChanged(height, width, oldHeight, oldWidth);
        } else {
            super.onSizeChanged(width, height, oldWidth, oldHeight);
        }
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        ViewParent parent = getParentForAccessibility();
        if (parent instanceof ViewGroup) {
            disableClipping((ViewGroup) parent);
        }
    }

    /**
     * Disables clipping for parent views, so label can be drawn over other views
     *
     * @param parent
     */
    private void disableClipping(final ViewGroup parent) {
        parent.setClipChildren(false);
        final int count = parent.getChildCount();
        for (int i = 0; i < count; i++) {
            final View child = parent.getChildAt(i);
            if (child instanceof ViewGroup) {
                disableClipping((ViewGroup) child);
            }
        }
    }

    /**
     * changes measured dimensions depending on orientation
     *
     * @param widthMeasureSpec
     * @param heightMeasureSpec
     */
    @Override
    protected final synchronized void onMeasure(final int widthMeasureSpec, final int heightMeasureSpec) {
        initTextBounds();
        if (this.mIsVertical) {
            super.onMeasure(heightMeasureSpec, widthMeasureSpec);
            this.setMeasuredDimension(this.getMeasuredHeight(), this.getMeasuredWidth());
        } else {
            super.onMeasure(widthMeasureSpec, heightMeasureSpec);
            this.setMeasuredDimension(this.getMeasuredWidth(), this.getMeasuredHeight());
        }
    }

    /**
     * draw label when enabled ({@link #mShowLabel})
     * @param c
     */
    @Override
    protected final void onDraw(final Canvas c) {
        if (this.mIsVertical) {
            c.rotate(ROTATION_ANGLE);
            c.translate(-this.getHeight(), 0);
        }
        final Rect bounds = getThumb().getBounds();
        if (bounds == null) {
            Log.i("Coords", "Bounds = null");
            return;
        }
        if (isPressed() && this.mShowLabel && isMoving()) {
            final float centerX = bounds.centerX() + getPaddingLeft();
            final float centerY = bounds.centerY() - this.mLabelPadding * 5;
            drawLabel(c, centerX, centerY);
        }
        super.onDraw(c);
    }

    /**
     * Draws label on canvas
     * @param canvas
     * @param centerX
     * @param centerY
     */
    private void drawLabel(final Canvas canvas, final float centerX, final float centerY) {

        //Calc Text Bounds
        initTextBounds();
        final String tmp = String.valueOf(getProgress());
        final int width = this.mRect.width() / 2;
        final int height = this.mRect.height() / 2;
        final float textCenter = centerY - mRect.height() / 2;

        //If Vertical rotate 90°
        if (this.mIsVertical) {
            canvas.save();
            canvas.rotate(ROTATION_ANGLE * -1, centerX, textCenter);
        }

        //Calc Corners of Text Background
        final float left = centerX - width - this.mLabelPadding;
        final float right = centerX + width + this.mLabelPadding;
        final float top = textCenter - height - this.mLabelPadding;
        final float bottom = textCenter + height + this.mLabelPadding;

        //Draw Background
        this.mPaint.reset();
        this.mPaint.setAntiAlias(true);
        this.mPaint.setColor(mLabelColor);
        this.mPaint.setStyle(Paint.Style.FILL);

        canvas.drawRect(left, top, right, bottom, this.mPaint);

        Log.i("Coords", "left: " + left + ", top: " + top + ", right: " + right + ", bottom: " + bottom
                + ", centerX: " + centerX + ", " + "centerY: " + centerY);

        //Draw Text
        initPaintForLabel();

        canvas.drawText(tmp, centerX, centerY, this.mPaint);

        if (mIsVertical) {
            canvas.restore();
        }

    }

    /**
     * initializes paint for label
     */
    private void initPaintForLabel() {
        this.mPaint.reset();
        this.mPaint.setAntiAlias(true);
        this.mPaint.setTextSize(this.mLabelTextSize);
        this.mPaint.setTextAlign(Paint.Align.CENTER);
        this.mPaint.setColor(this.mLabelTextColor);
        this.mPaint.setTypeface(this.mTypeFace);
    }

    /**
     * initializes textBounds for label
     */
    private void initTextBounds() {
        initPaintForLabel();
        final String tmp = String.valueOf(getMax());
        this.mPaint.getTextBounds(tmp, 0, tmp.length(), this.mRect);
    }

    /**
     * check if thumb is moving to decide if label should be drawn
     * @return
     */
    private boolean isMoving() {
        final int difference = this.mStartProgress - getProgress();
        return Math.abs(difference) > 1;
    }

    @Override
    public final void setOnSeekBarChangeListener(final OnSeekBarChangeListener l) {
        this.mOnSeekBarChangeListener = l;
        super.setOnSeekBarChangeListener(l);
    }

    /**
     * detects different user gestures on seekbar / thumb
     * @param event
     * @return
     */
    @Override
    public final boolean onTouchEvent(final MotionEvent event) {
        super.onTouchEvent(event);
        if (!this.isEnabled()) {
            return false;
        }
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                if (this.mIsVertical) {
                    getParent().requestDisallowInterceptTouchEvent(true);
                    this.setProgress(this.getMax() - (int) (this.getMax() * event.getY() / this.getHeight()));
                    if (this.mOnSeekBarChangeListener != null) {
                        this.mOnSeekBarChangeListener.onStartTrackingTouch(this);
                    }
                } else {
                    getParent().requestDisallowInterceptTouchEvent(true);
                    this.setProgress((int) (this.getMax() * event.getX() / this.getWidth()));
                    if (this.mOnSeekBarChangeListener != null) {
                        this.mOnSeekBarChangeListener.onStartTrackingTouch(this);
                    }
                }
                this.mStartProgress = getProgress();
                setPressed(true);
                Log.i("Action", "Down");
                break;

            case MotionEvent.ACTION_MOVE:
                if (this.mIsVertical) {
                    this.setProgress(this.getMax() - (int) (this.getMax() * event.getY() / this.getHeight()));
                    if (this.mOnSeekBarChangeListener != null) {
                        this.mOnSeekBarChangeListener.onProgressChanged(this, this.getProgress(), true);
                    }
                } else {
                    this.setProgress((int) (this.getMax() * event.getX() / this.getWidth()));
                    if (this.mOnSeekBarChangeListener != null) {
                        this.mOnSeekBarChangeListener.onProgressChanged(this, this.getProgress(), true);
                    }
                }
                if (isMoving()) {
                    this.mStartProgress = Integer.MAX_VALUE;
                }
                Log.i("Action", "Move");
                break;

            case MotionEvent.ACTION_UP:
                if (this.mIsVertical) {
                    getParent().requestDisallowInterceptTouchEvent(false);
                    this.setProgress(this.getMax() - (int) (this.getMax() * event.getY() / this.getHeight()));
                    if (this.mOnSeekBarChangeListener != null) {
                        this.mOnSeekBarChangeListener.onProgressChanged(this, this.getProgress(), true);
                        this.mOnSeekBarChangeListener.onStopTrackingTouch(this);
                    }
                } else {
                    getParent().requestDisallowInterceptTouchEvent(false);
                    this.setProgress((int) (this.getMax() * event.getX() / this.getWidth()));
                    if (this.mOnSeekBarChangeListener != null) {
                        this.mOnSeekBarChangeListener.onProgressChanged(this, this.getProgress(), true);
                        this.mOnSeekBarChangeListener.onStopTrackingTouch(this);
                    }
                }
                setPressed(false);
                break;

            case MotionEvent.ACTION_CANCEL:
                setProgress(getProgress());
                if (this.mIsVertical) {
                    if (this.mOnSeekBarChangeListener != null) {
                        this.mOnSeekBarChangeListener.onProgressChanged(this, this.getProgress(), false);
                        this.mOnSeekBarChangeListener.onStopTrackingTouch(this);
                    }
                }
                setPressed(false);
                break;

            default:
                break;
        }

        return true;
    }

    @Override
    public final void setProgress(final int progress) {
        super.setProgress(progress);
        this.onSizeChanged(this.getWidth(), this.getHeight(), 0, 0);
    }

}
