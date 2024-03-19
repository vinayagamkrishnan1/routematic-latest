package com.bosch.app.lib.widget;

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.drawable.GradientDrawable;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import android.util.AttributeSet;
import android.view.View;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.view.animation.ScaleAnimation;
import android.widget.LinearLayout;

import com.bosch.app.lib.R;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 14.12.17.
 */

/**
 * Definition:
 * A progress indicator visualizes the progress of an operation that is caused by the user.
 * It can be determinate (loading duration is known) or indeterminate (loading duration is unknown).
 * Progress indicators are noninteractive elements which are either
 * displayed as a popover on the whole screen or at a specific, content pending position.
 * <p>
 * Usage:
 * Progress indicators should be used to visualize the progress of operations caused by the user. (See also {@link BoschActivityIndicator}).
 * Determinated progress indicators should only be used for operations that are measurable, e.g. the loading time of a download.
 * Indeterminated progress indicators should only be used for operations that are not measurable, e.g. loading additional content on a page.
 * <p>
 * View Attributes:
 * {@link R.styleable#BoschProgressIndicator_indeterminate}
 * - creates an infinite progress which always moves from left to right
 * <p>
 * Public view methods:
 * {@link #setProgress(int)}
 */

public class BoschProgressIndicator extends LinearLayout {

    private LinearLayout mProgressBackground;
    private View mProgress;
    private float mOldX;
    private boolean mIndeterminate;

    public BoschProgressIndicator(Context context) {
        super(context);
        init(context, null);
    }

    public BoschProgressIndicator(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    public BoschProgressIndicator(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }

    public BoschProgressIndicator(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
        init(context, attrs);
    }

    private void init(final Context context, final AttributeSet attrs) {
        inflate(context, R.layout.bosch_progress_indicator, this);

        this.mProgressBackground = findViewById(R.id.progressBackground);
        this.mProgress = findViewById(R.id.progress);
        this.mOldX = 0;

        if (attrs != null) {
            TypedArray a = context.getTheme().obtainStyledAttributes(
                    attrs,
                    R.styleable.BoschProgressIndicator,
                    0, 0);
            try {
                this.mIndeterminate = a.getBoolean(R.styleable.BoschProgressIndicator_indeterminate, false);
            } finally {
                a.recycle();
            }
        }
        if (this.mIndeterminate) {
            this.mProgressBackground.setBackgroundResource(R.color.boschDarkBlue);
            this.mProgress.setBackground(getIndeterminateDrawable(context));
            startIndeterminateAnimation();
        }
    }

    private GradientDrawable getIndeterminateDrawable(final Context context) {
        GradientDrawable gradientDrawable = new GradientDrawable(
                GradientDrawable.Orientation.LEFT_RIGHT,
                new int[]{ContextCompat.getColor(context, R.color.boschDarkBlue),
                        ContextCompat.getColor(context, R.color.boschLightBlue),
                        ContextCompat.getColor(context, R.color.boschLightBlueW25),
                        ContextCompat.getColor(context, R.color.boschLightBlue),
                        ContextCompat.getColor(context, R.color.boschDarkBlue)});
        return gradientDrawable;
    }

    private void startIndeterminateAnimation() {
        Animation anim = AnimationUtils.loadAnimation(getContext(), R.anim.bosch_progress_indeterminate);
        this.mProgress.startAnimation(anim);
        this.mProgress.setVisibility(VISIBLE);
    }

    /**
     * Sets the current progress
     *
     * @param progress
     */
    public void setProgress(final int progress) {
        if (!this.mIndeterminate) {
            final float toX = (float) progress / 100;

            final ScaleAnimation anim = new ScaleAnimation(mOldX, toX, 1.0f, 1.0f,
                    Animation.RELATIVE_TO_PARENT, 0f,
                    Animation.RELATIVE_TO_PARENT, 0f);
            anim.setDuration(250);
            anim.setInterpolator(new AccelerateDecelerateInterpolator());
            anim.setFillAfter(true);

            this.mOldX = toX;

            this.mProgress.startAnimation(anim);
            this.mProgress.setVisibility(VISIBLE);
        }
    }
}
