package com.bosch.app.lib.widget;

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import androidx.annotation.NonNull;
import androidx.core.graphics.drawable.DrawableCompat;
import androidx.appcompat.widget.AppCompatButton;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.view.Gravity;

import com.bosch.app.lib.R;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 28.10.17.
 */

/**
 * Always use with one of the following styles in xml declaration:
 * - {@link R.style#Widget_Bosch_Button_Primary}
 * - {@link R.style#Widget_Bosch_Button_Primary_Inverted}
 * - {@link R.style#Widget_Bosch_Button_Secondary}
 * - {@link R.style#Widget_Bosch_Button_Tertiary}
 * <p>
 * Definition:
 * A button is a clickable area within an interactive interface.
 * Clicking on the button triggers a function that is assigned to the button.
 * A button is labelled in such a way that the user knows which function is assigned to the button.
 */
public class BoschButton extends AppCompatButton {

    private Drawable mIcon;
    private int mMeasuredWidth;
    private int mGu;

    public BoschButton(Context context) {
        super(context);
    }

    public BoschButton(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    public BoschButton(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }

    /**
     * initializes this view, gets every predefined attribute from xml
     *
     * @param context
     * @param attrs
     */
    private void init(@NonNull Context context, AttributeSet attrs) {
        this.mGu = context.getResources().getDimensionPixelOffset(R.dimen.gu);

        TypedArray a = context.getTheme().obtainStyledAttributes(
                attrs,
                R.styleable.BoschButton,
                0, 0);
        Drawable icon;
        final int enumValue;
        try {
            icon = a.getDrawable(R.styleable.BoschButton_iconDrawable);
            enumValue = a.getInteger(R.styleable.BoschButton_boschIcon, -1);
        } finally {
            a.recycle();
        }
        if (icon == null && enumValue >= 0) {
            final int id = BoschResources.getDrawableId(enumValue);
            if (id != -1) {
                icon = context.getDrawable(id);
            }
        }

        if (icon != null) {
            this.mIcon = icon.mutate();
            if (this.mIcon != null) {
                DrawableCompat.setTintList(this.mIcon, getTextColors());
                setCompoundDrawablesWithIntrinsicBounds(this.mIcon, null, null, null);
                if (TextUtils.isEmpty(getText())) {
                    setMaxWidth(this.mIcon.getIntrinsicWidth() + this.mGu * 3);
                }
                setCompoundDrawablePadding(this.mGu);
            }
        }
    }

    @Override
    protected void onDraw(Canvas canvas) {
        updateIconBounds();
        super.onDraw(canvas);
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int mode = MeasureSpec.getMode(widthMeasureSpec);
        int size = MeasureSpec.getSize(widthMeasureSpec);
        if (this.mIcon != null && mode == MeasureSpec.EXACTLY) {
            super.onMeasure(MeasureSpec.makeMeasureSpec(size, MeasureSpec.AT_MOST), heightMeasureSpec);
            this.mMeasuredWidth = getMeasuredWidth();
        }
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
    }

    /**
     * updates icon position so its directly next to text or centered in button without text
     */
    private void updateIconBounds() {
        if (this.mIcon != null) {
            if (TextUtils.isEmpty(getText())) {
                int p = (int) (this.mGu * 1.5);
                setPadding(p, p, p, p);
            } else {
                int l = 0;
                if (this.mMeasuredWidth > 0 && getWidth() > this.mMeasuredWidth) {
                    //Check where the icon should be located, depending on the gravity
                    final int gravity = getGravity();
                    if ((gravity & Gravity.START) != Gravity.START) {
                        if ((gravity & Gravity.END) == Gravity.END) {
                            l = (getWidth() - this.mMeasuredWidth);
                        } else if ((gravity & Gravity.CENTER_HORIZONTAL) == Gravity.CENTER_HORIZONTAL) {
                            l = (getWidth() - this.mMeasuredWidth) / 2;
                        }
                    }
                }
                mIcon.setBounds(l, 0, this.mIcon.getIntrinsicWidth() + l, mIcon.getIntrinsicHeight());
            }
        }
    }

}
