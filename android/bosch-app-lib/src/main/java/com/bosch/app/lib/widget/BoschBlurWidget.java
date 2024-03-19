package com.bosch.app.lib.widget;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.ColorFilter;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffColorFilter;
import android.graphics.drawable.BitmapDrawable;
import android.renderscript.Allocation;
import android.renderscript.Element;
import android.renderscript.RenderScript;
import android.renderscript.ScriptIntrinsicBlur;
import androidx.core.content.ContextCompat;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.bosch.app.lib.R;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 04.01.18.
 */

/**
 * Widget to Blur Background behind {@link BoschSideNavigation}
 * <p>
 * public Methods:
 * {@link #prepareBlur(View)}
 * <p>
 * {@link #show()}
 * <p>
 * {@link #hideBlur(View)}
 * <p>
 * {@link #setAlpha(float)}
 */
class BoschBlurWidget {

    private static final float BITMAP_SCALE = 0.4f;
    private static final float BLUR_RADIUS = 7.5f;

    private float mBlurRadius = BLUR_RADIUS;

    private Context mContext;
    private Bitmap mInput;
    private Bitmap mOutput;
    private RenderScript mRenderScript;
    private ScriptIntrinsicBlur mIntrinsicBlur;
    private Allocation mTmpIn;
    private Allocation mTmpOut;
    private View mBlurView;
    private View mRootView;
    private ColorFilter mColorFilter;

    public BoschBlurWidget(final Context context) {
        this.mContext = context;
        init(context);
    }

    private void init(final Context context) {
        if (context != null) {
            this.mBlurView = LayoutInflater.from(context).inflate(R.layout.bosch_blur_view, (ViewGroup) this.mRootView, false);
            this.mRenderScript = RenderScript.create(context);
            this.mIntrinsicBlur = ScriptIntrinsicBlur.create(this.mRenderScript, Element.U8_4(this.mRenderScript));
            final Resources res = context.getResources();
            if (res != null) {
                this.mBlurRadius = res.getDimension(R.dimen.gu);
            }
            if (this.mBlurRadius > 25) {
                this.mBlurRadius = 25;
            }
            this.mIntrinsicBlur.setRadius(this.mBlurRadius);
            this.mColorFilter = new PorterDuffColorFilter(ContextCompat.getColor(context, R.color.boschBlurGray), PorterDuff.Mode.OVERLAY);
        }
    }

    /**
     * prepares the blur effect on
     *
     * @param view a "screenshot" of {@link #mRootView} is created, this bitmap gets blurred with {@link #blur(Bitmap)} and afterwards
     *             set as background of {@link #mBlurView}
     */
    public void prepareBlur(final View view) {
        if (view != null) {
            this.mRootView = view;
            view.post(new Runnable() {
                public void run() {
                    if (BoschBlurWidget.this.mContext != null
                            && BoschBlurWidget.this.mBlurView != null
                            && BoschBlurWidget.this.mRootView != null) {

                        final BitmapDrawable bitmapDrawable =
                                new BitmapDrawable(
                                        BoschBlurWidget.this.mContext.getResources(),
                                        blur(getScreenshot(BoschBlurWidget.this.mRootView))
                                );
                        bitmapDrawable.setColorFilter(BoschBlurWidget.this.mColorFilter);
                        BoschBlurWidget.this.mBlurView.setBackground(bitmapDrawable);
                    }
                }
            });
        }
    }

    /**
     * @param image Bitmap which should be blurred
     * @return blurred Bitmap
     */
    private Bitmap blur(final Bitmap image) {
        int width = Math.round(image.getWidth() * this.BITMAP_SCALE);
        int height = Math.round(image.getHeight() * this.BITMAP_SCALE);

        this.mInput = Bitmap.createScaledBitmap(image, width, height, false);
        this.mOutput = Bitmap.createBitmap(this.mInput);

        this.mTmpIn = Allocation.createFromBitmap(this.mRenderScript, this.mInput);
        this.mTmpOut = Allocation.createFromBitmap(this.mRenderScript, this.mOutput);

        this.mIntrinsicBlur.setInput(this.mTmpIn);
        this.mIntrinsicBlur.forEach(this.mTmpOut);
        this.mTmpOut.copyTo(this.mOutput);

        return this.mOutput;
    }

    /**
     * creates "screenshot" of
     *
     * @param v
     * @return
     */
    private Bitmap getScreenshot(View v) {
        Bitmap b = Bitmap.createBitmap(v.getWidth(), v.getHeight(), Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(b);
        v.draw(c);
        return b;
    }

    /**
     * shows the blurred View
     */
    public void show() {
        if (this.mRootView != null && this.mBlurView != null) {
            this.mRootView.post(new Runnable() {
                public void run() {
                    if (BoschBlurWidget.this.mRootView instanceof ViewGroup) {
                        if (BoschBlurWidget.this.mBlurView.getParent() == null) {
                            ((ViewGroup) BoschBlurWidget.this.mRootView).addView(BoschBlurWidget.this.mBlurView);
                        }
                    }
                }
            });
        }
    }

    /**
     * hides the blurred view
     *
     * @param parent
     */
    public void hideBlur(final View parent) {
        if (parent != null) {
            parent.post(new Runnable() {
                @Override
                public void run() {
                    if (BoschBlurWidget.this.mRootView instanceof ViewGroup && BoschBlurWidget.this.mBlurView != null) {
                        if (BoschBlurWidget.this.mBlurView.getParent() == BoschBlurWidget.this.mRootView) {
                            ((ViewGroup) BoschBlurWidget.this.mRootView).removeView(BoschBlurWidget.this.mBlurView);
                        }
                    }
                }
            });
        }
    }

    /**
     * sets Alpha to Blurred View
     *
     * @param alpha
     */
    public void setAlpha(final float alpha) {
        if (this.mBlurView != null) {
            this.mBlurView.setAlpha(alpha);
        }
    }

}
