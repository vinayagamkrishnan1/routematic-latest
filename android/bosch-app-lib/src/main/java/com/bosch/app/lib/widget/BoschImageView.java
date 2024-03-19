package com.bosch.app.lib.widget;

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.drawable.Drawable;
import androidx.core.graphics.drawable.DrawableCompat;
import androidx.appcompat.widget.AppCompatImageView;
import android.util.AttributeSet;

import com.bosch.app.lib.R;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 10.11.17.
 */

/**
 * Imageview which can handle bosch icons directly
 * <p>
 * Attributes:
 * {@link R.styleable#BoschImageView_boschIcon}
 * - Reference to all drawable in this library
 * {@link R.styleable#BoschImageView_iconDrawable}
 * - handles every other drawable
 * {@link R.styleable#BoschImageView_color}
 * - tint color of image view
 */
public class BoschImageView extends AppCompatImageView {

    private int mTintColor;
    private boolean mTintProgSetIcon;

    public BoschImageView(Context context) {
        super(context);
    }

    public BoschImageView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    public BoschImageView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }

    private void init(Context context, AttributeSet attrs) {
        TypedArray a = context.getTheme().obtainStyledAttributes(
                attrs,
                R.styleable.BoschImageView,
                0, 0);

        Drawable icon;
        final int color;
        final int drawableValue;
        try {
            icon = a.getDrawable(R.styleable.BoschImageView_iconDrawable);
            color = a.getColor(R.styleable.BoschImageView_color, Color.TRANSPARENT);
            drawableValue = a.getInteger(R.styleable.BoschImageView_boschIcon, -1);
        } finally {
            a.recycle();
        }
        if (icon == null) {
            mTintColor = color;
            mTintProgSetIcon = true;
            if (drawableValue > -1) {
                setBackgroundResource(BoschResources.getDrawableId(drawableValue));
            }
        } else {
            tintIcon(icon.mutate(), color);
        }

    }

    private void tintIcon(final Drawable icon, final int color) {
        if (icon != null && color != Color.TRANSPARENT) {
            DrawableCompat.setTint(icon, color);
        }
        setBackgroundDrawable(icon);
    }

    //Used to tint icons which are set programmatically
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (mTintProgSetIcon) {
            final Drawable icon = getBackground();
            if (icon != null) {
                tintIcon(icon.mutate(), mTintColor);
            }
        }
    }

    @Override
    public boolean performClick() {
        return super.performClick();
    }
}
