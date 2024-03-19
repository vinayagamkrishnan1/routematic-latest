package com.bosch.app.lib.widget;

import android.content.Context;
import android.content.res.Resources;
import android.content.res.TypedArray;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.Typeface;
import androidx.core.content.ContextCompat;
import androidx.core.content.res.ResourcesCompat;
import androidx.appcompat.widget.AppCompatEditText;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.util.Log;
import android.view.Gravity;

import com.bosch.app.lib.R;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 23.11.17.
 */

/**
 * Always use {@link R.style#Widget_Bosch_TextField} in xml declaration
 * <p>
 * Definition:
 * A text field is an input area for user generated text.
 * It is a single-line field, that is fixed in height and can have a label.
 * Labels provide information about the required input.
 * Text is only editable, when the text field has been activated by tapping on it.
 * Tapping on the input area automatically brings up a keyboard and text can be entered.
 * Optionally, there is a feedback displayed after text input, e.g. in cases where the content needs to be validated.
 * <p>
 * Usage:
 * Use a text field in all cases, where the user needs to input individual text that is not predictable.
 * Typical use cases are search functionalities, login screens, or user generated content.
 * <p>
 * View Attributes:
 * {@link R.styleable#BoschTextField_label}:
 * - Label which should be Displayed above Text
 * <p>
 * Public view methods:
 * {@link #showValidation(int)}
 *
 * {@link #showVa}
 *
 * {@link #showValidation(int, String)}
 * <p>
 * {@link #setLabel(String)}
 */
public class BoschTextField extends AppCompatEditText {

    /**
     * Default shows no text and no colored line
     */
    public static final int STATUS_DEFAULT = 0;

    /**
     * OK shows green text and green line {@link R.color#boschLightGreen}
     */
    public static final int STATUS_OK = 1;

    /**
     * Warning shows yellow text and yellow line {@link R.color#boschYellow}
     */
    public static final int STATUS_WARNING = 2;

    /**
     * Warning shows red text and red line {@link R.color#boschRed}
     */
    public static final int STATUS_ERROR = 3;

    private Paint mPaint;
    private String mLabel;
    private boolean mDrawLabel;
    private int mLabelColorEnabled;
    private int mLabelColorDisabled;
    private String mLongestText;

    private int mValidationStatus;
    private String mValidation;
    private boolean mDrawValidation;

    public BoschTextField(Context context) {
        super(context);
    }

    public BoschTextField(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    public BoschTextField(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }


    private void init(final Context context, final AttributeSet attrs) {

        TypedArray a = context.getTheme().obtainStyledAttributes(
                attrs,
                R.styleable.BoschTextField,
                0, 0);
        try {
            mLabel = a.getString(R.styleable.BoschTextField_label);
        } finally {
            a.recycle();
        }
        if (!TextUtils.isEmpty(mLabel)) {
            initWidth(context);
        } else {
            mDrawLabel = false;
            setGravity(Gravity.CENTER_VERTICAL);
        }
    }

    /**
     * calculates the min width of the textfield
     *
     * @param context
     */
    private void initWidth(final Context context) {
        if (context != null) {
            final Resources res = context.getResources();
            final float labelTextSize;
            if (res != null) {
                labelTextSize = res.getDimension(R.dimen.text_gu);
                mLabelColorEnabled = res.getColor(R.color.boschBlack);
                mLabelColorDisabled = res.getColor(R.color.boschLightGray);
            } else {
                labelTextSize = 25;
                mLabelColorEnabled = Color.BLACK;
                mLabelColorDisabled = Color.GRAY;
            }
            final Typeface typeface = ResourcesCompat.getFont(context, R.font.bosch_sans_medium);
            mPaint = new Paint();
            mPaint.setTypeface(typeface);
            mPaint.setAntiAlias(true);
            mPaint.setTextSize(labelTextSize);

            final Rect rect = new Rect();
            int width = 0;
            if (!TextUtils.isEmpty(mLabel)) {
                mPaint.getTextBounds(mLabel, 0, mLabel.length(), rect);
                width = rect.width();
                mDrawLabel = true;
                setGravity(Gravity.BOTTOM);
            }
            if (!TextUtils.isEmpty(mLongestText)) {
                mPaint.getTextBounds(mLongestText, 0, mLongestText.length(), rect);
                width = rect.width() > width ? rect.width() : width;
                setMaxWidth(width + getPaddingLeft() + getPaddingRight());
            }
            if (!TextUtils.isEmpty(mValidation)) {
                mPaint.getTextBounds(mValidation, 0, mValidation.length(), rect);
                width = rect.width() > width ? rect.width() : width;
                setMaxWidth(width + getPaddingLeft() + getPaddingRight());
            }
            if (width > 0) {
                setMinWidth(width + getPaddingLeft() + getPaddingRight());
            }
        }
    }

    /**
     * draws label or validation text
     *
     * @param canvas
     */
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (mDrawLabel) {
            drawLabel(canvas);
        }
        if (mDrawValidation) {
            drawValidation(canvas);
        }
    }

    /**
     * draws the label
     *
     * @param canvas
     */
    private void drawLabel(Canvas canvas) {
        if (mPaint != null) {
            mPaint.setColor(isEnabled() ? mLabelColorEnabled : mLabelColorDisabled);
            Log.i("TextField", "PaddingStart: " + getPaddingStart() + ", ScrollX: " + getScrollX());
            canvas.drawText(mLabel, getPaddingStart() + getScrollX(), getPaddingTop() * 2, mPaint);
        }
    }

    /**
     * draws the validation
     *
     * @param canvas
     */
    private void drawValidation(Canvas canvas) {
        if (mPaint != null && !TextUtils.isEmpty(mValidation)) {
            mPaint.setColor(getValidationColor());
            Log.i("Validation", mValidation);
            canvas.drawText(mValidation, getPaddingStart() + getScrollX(), getHeight() - getPaddingTop() / 2, mPaint);
        }
    }

    /**
     * @return validation color
     */
    private int getValidationColor() {
        switch (mValidationStatus) {
            case STATUS_OK:
                return ContextCompat.getColor(getContext(), R.color.boschLightGreen);
            case STATUS_WARNING:
                return ContextCompat.getColor(getContext(), R.color.boschYellow);
            case STATUS_ERROR:
                return ContextCompat.getColor(getContext(), R.color.boschRed);
            default:
                return ContextCompat.getColor(getContext(), android.R.color.black);
        }
    }

    /**
     * set longest possible text to calculate the min width of the textfield
     *
     * @param text
     */
    protected void setLongestPossibleText(final String text) {
        mLongestText = text;
        initWidth(getContext());
    }

    /**
     * @param label which is shown above text
     */
    public void setLabel(final String label) {
        if (!TextUtils.isEmpty(label)) {
            mLabel = label;
            initWidth(getContext());
        } else {
            mDrawLabel = false;
        }
    }

    /**
     * Shows only the colored line
     *
     * @param status {@link #STATUS_DEFAULT} || {@link #STATUS_OK} || {@link #STATUS_WARNING} || {@link #STATUS_ERROR}
     */
    public void showValidation(final int status) {
        showValidation(status, null);
    }

    /**
     * Shows colored line and validation string from resources
     *
     * @param status {@link #STATUS_DEFAULT} || {@link #STATUS_OK} || {@link #STATUS_WARNING} || {@link #STATUS_ERROR}
     * @param resId
     */
    public void showValidation(final int status, final int resId) {
        if (getContext() != null) {
            showValidation(status, getContext().getString(resId));
        }
    }

    /**
     * Shows colored line and validation string
     *
     * @param status {@link #STATUS_DEFAULT} || {@link #STATUS_OK} || {@link #STATUS_WARNING} || {@link #STATUS_ERROR}
     * @param text   validation text
     */
    public void showValidation(final int status, final String text) {
        if (status == STATUS_DEFAULT) {
            mDrawValidation = false;
        } else {
            mValidationStatus = status;
            mValidation = text;
            mDrawValidation = true;
            initWidth(getContext());
        }
        if (getBackground() != null) {
            getBackground().setLevel(status);
        }
        invalidate();
    }
}
