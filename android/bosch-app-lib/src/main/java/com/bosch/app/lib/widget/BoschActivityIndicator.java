package com.bosch.app.lib.widget;

import android.app.Dialog;
import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;

import com.bosch.app.lib.R;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 21.11.17.
 */

/**
 * View needs to lay over all other views in layout
 * <p>
 * Definition:
 * An activity indicator is a small animated element with a defined size that is used to bridge idle times
 * while an app is operating in the background and can not be used for a certain period.
 * They are designed to visually please users and enhance the brand experience with Bosch while using an app.
 * Activity indicators are noninteractive elements which are either displayed as a
 * popover on the whole screen or at a specific, content pending position.
 * <p>
 * Usage:
 * Activity indicators should be used in any situation where an app needs time to be ready for operation.
 * Avoid using it, when the loading time is less than 3 seconds.
 * In contrast to progress indicators, an activity indicator shows activity of the system that is not caused by an user action.
 * <p>
 * Public view methods:
 * {@link #show()}
 * <p>
 * {@link #hide()}
 * <p>
 * {@link #cancel()}
 * <p>
 * {@link #dismiss()}
 */
public class BoschActivityIndicator extends Dialog implements Animation.AnimationListener {

    private ImageView mSquareUnder;
    private ImageView mSquareOver;
    private ImageView mCenter;

    private Animation mAnimLeft;
    private Animation mAnimRight;
    private Animation mAnimTop;
    private Animation mAnimBottom;
    private Animation mScaleVertical;
    private Animation mScaleHorizontal;
    private Animation mFadeIn;
    private Animation mFadeOut;

    private int mCount = 1;
    private boolean mStop = false;

    /**
     * sequence of colors in animation
     */
    private static final int[] COLORS = new int[]{
            R.color.boschDarkGreen,
            R.color.boschLightGreen,
            R.color.boschTurquoise,
            R.color.boschLightBlue,
            R.color.boschDarkBlue,
            R.color.boschViolet,
            R.color.boschFuchsia,
            R.color.boschRed
    };

    public BoschActivityIndicator(Context context) {
        super(context);
        init(context);
    }

    private void init(final Context context) {
        final View rootView = LayoutInflater.from(context).inflate(R.layout.bosch_activity_indicator, null);
        this.mSquareUnder = rootView.findViewById(R.id.squareUnder);
        this.mSquareOver = rootView.findViewById(R.id.squareOver);

        this.mCenter = rootView.findViewById(R.id.middle);
        setContentView(rootView);
        final Window window = getWindow();
        if (window != null) {
            window.setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
            window.clearFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND);
        }
        setCancelable(false);
    }

    /**
     * Starts the loading animation and shows loader
     */
    @Override
    public void show() {
        super.show();
        this.mStop = false;
        startFadeIn();
    }

    /**
     * Stops the loading animation and dismisses loader
     */
    @Override
    public void cancel() {
        dismiss();
    }

    @Override
    public void dismiss() {
        this.mStop = true;
    }

    /**
     * starts first animation -> fade in
     */
    private void startFadeIn() {
        if (this.mCenter != null && this.mSquareOver != null && this.mSquareUnder != null) {

            this.mCenter.setVisibility(View.VISIBLE);
            this.mSquareOver.setVisibility(View.VISIBLE);
            this.mSquareUnder.setVisibility(View.VISIBLE);

            this.mCenter.setBackgroundResource(this.COLORS[mCount]);
            this.mSquareOver.setBackgroundResource(this.COLORS[mCount]);
            this.mSquareUnder.setBackgroundResource(this.COLORS[mCount]);

            this.mCenter.startAnimation(getAnimFadeIn());
            this.mSquareOver.startAnimation(getAnimFadeIn());
            this.mSquareUnder.startAnimation(getAnimFadeIn());

        }
    }

    /**
     * Ends loading animation -> fade out
     */
    private void startFadeOut() {
        if (this.mCenter != null && this.mSquareOver != null && this.mSquareUnder != null) {

            this.mCenter.setVisibility(View.VISIBLE);
            this.mSquareOver.setVisibility(View.VISIBLE);
            this.mSquareUnder.setVisibility(View.VISIBLE);

            this.mCenter.setBackgroundResource(this.COLORS[mCount]);
            this.mSquareOver.setBackgroundResource(this.COLORS[mCount]);
            this.mSquareUnder.setBackgroundResource(this.COLORS[mCount]);

            this.mCenter.startAnimation(getAnimFadeOut());
            this.mSquareOver.startAnimation(getAnimFadeOut());
            this.mSquareUnder.startAnimation(getAnimFadeOut());

        }
    }

    /**
     * starts the horizontal animation
     */
    private void startHorizontal() {
        animateHorizontal();
        animateMiddleHorizontal();
    }

    /**
     * starts the vertical animation
     */
    private void startVertical() {
        animateVertical();
        animateMiddleVertical();
    }

    /**
     * sets new colors of squares and starts the horizontal animations of
     * {@link #mSquareOver} and {@link #mSquareUnder}
     */
    private void animateHorizontal() {
        if (this.mSquareUnder != null && this.mSquareOver != null) {
            this.mSquareOver.setBackgroundResource(this.COLORS[mCount]);
            this.mSquareUnder.setBackgroundResource(this.COLORS[mCount - 1]);
            this.mSquareUnder.startAnimation(getAnimLeft());
            this.mSquareOver.startAnimation(getAnimRight());
        }
    }

    /**
     * sets new colors of squares and starts the vertical animations of
     * {@link #mSquareOver} and {@link #mSquareUnder}
     */
    private void animateVertical() {
        if (this.mSquareUnder != null && this.mSquareOver != null) {
            this.mSquareOver.setBackgroundResource(this.COLORS[mCount]);
            this.mSquareUnder.setBackgroundResource(this.COLORS[mCount - 1]);
            this.mSquareUnder.startAnimation(getAnimBottom());
            this.mSquareOver.startAnimation(getAnimTop());
        }
    }

    /**
     * Animates the centered square for horizontal animation and sets its color
     */
    private void animateMiddleHorizontal() {
        if (this.mCenter != null) {
            updateCounter();
            this.mCenter.setBackgroundResource(this.COLORS[mCount]);
            this.mCenter.startAnimation(getScaleHorizontal());
        }
    }

    /**
     * Animates the centered square for vertical animation and sets its color
     */
    private void animateMiddleVertical() {
        if (this.mCenter != null) {
            updateCounter();
            this.mCenter.setBackgroundResource(this.COLORS[mCount]);
            this.mCenter.startAnimation(getScaleVertical());
        }
    }

    /**
     * updates counter so the next color in {@link #COLORS} can be selected
     */
    private void updateCounter() {
        if (this.mCount < this.COLORS.length - 1) {
            this.mCount += 1;
        } else {
            this.mCount = 1;
        }
    }

    /**
     * @return fade in animation
     */
    private Animation getAnimFadeIn() {
        if (this.mFadeIn == null) {
            this.mFadeIn = AnimationUtils.loadAnimation(getContext(), R.anim.bosch_loader_fade_in);
            this.mFadeIn.setAnimationListener(this);
        }
        return this.mFadeIn;
    }

    /**
     * @return fade out animation
     */
    private Animation getAnimFadeOut() {
        if (this.mFadeOut == null) {
            this.mFadeOut = AnimationUtils.loadAnimation(getContext(), R.anim.bosch_loader_fade_out);
            this.mFadeOut.setAnimationListener(this);
        }
        return this.mFadeOut;
    }

    /**
     * @return animation which animations square to the left side
     */
    private Animation getAnimLeft() {
        if (this.mAnimLeft == null) {
            this.mAnimLeft = AnimationUtils.loadAnimation(getContext(), R.anim.bosch_loader_translate_left);
            this.mAnimLeft.setAnimationListener(this);
        }
        return this.mAnimLeft;
    }

    /**
     * @return animation which animations square to the right side
     */
    private Animation getAnimRight() {
        if (this.mAnimRight == null) {
            this.mAnimRight = AnimationUtils.loadAnimation(getContext(), R.anim.bosch_loader_translate_right);
        }
        return this.mAnimRight;
    }

    /**
     * @return animation which animations square to top
     */
    private Animation getAnimTop() {
        if (this.mAnimTop == null) {
            this.mAnimTop = AnimationUtils.loadAnimation(getContext(), R.anim.bosch_loader_translate_top);
        }
        return this.mAnimTop;
    }

    /**
     * @return animation which animations square to bottom
     */
    private Animation getAnimBottom() {
        if (this.mAnimBottom == null) {
            this.mAnimBottom = AnimationUtils.loadAnimation(getContext(), R.anim.bosch_loader_translate_bottom);
            this.mAnimBottom.setAnimationListener(this);
        }
        return this.mAnimBottom;
    }

    /**
     * @return animation which scales {@link #mCenter} in vertical direction
     */
    private Animation getScaleVertical() {
        if (this.mScaleVertical == null) {
            this.mScaleVertical = AnimationUtils.loadAnimation(getContext(), R.anim.bosch_loader_scale_vertical);
        }
        return this.mScaleVertical;
    }

    /**
     * @return animation which scales {@link #mCenter} in horizontal direction
     */
    private Animation getScaleHorizontal() {
        if (this.mScaleHorizontal == null) {
            this.mScaleHorizontal = AnimationUtils.loadAnimation(getContext(), R.anim.bosch_loader_scale_horizontal);
        }
        return this.mScaleHorizontal;
    }

    @Override
    public void onAnimationStart(Animation animation) {

    }

    /**
     * if {@link #getAnimLeft()} or {@link #getAnimBottom()} ends and {@link #dismiss()}, {@link #hide()} or {@link #cancel()}
     * were called start fade out to hide the dialog, otherwise start {@link #startVertical()} or {@link #startHorizontal()}
     * if {@link #getAnimFadeIn()} ends, start with {@link #startHorizontal()}
     * if {@link #getAnimFadeOut()} ends dismiss this dialog
     *
     * @param animation
     */
    @Override
    public void onAnimationEnd(Animation animation) {
        if (animation == this.mAnimLeft) {
            if (this.mStop) {
                startFadeOut();
            } else {
                startVertical();
            }
        } else if (animation == this.mAnimBottom) {
            if (this.mStop) {
                startFadeOut();
            } else {
                startHorizontal();
            }
        } else if (animation == this.mFadeIn) {
            startHorizontal();
        } else if (animation == this.mFadeOut) {
            super.dismiss();
        }
    }

    @Override
    public void onAnimationRepeat(Animation animation) {

    }
}
