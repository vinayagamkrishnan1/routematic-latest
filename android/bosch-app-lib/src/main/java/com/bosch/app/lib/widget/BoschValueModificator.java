package com.bosch.app.lib.widget;

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.drawable.Drawable;
import android.os.Handler;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;

import com.bosch.app.lib.R;

import java.util.Locale;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 28.11.17.
 */

/**
 * Always use {@link R.style#Widget_Bosch_ValueModificator} in xml declaration
 * <p>
 * Definition:
 * The value modificator allows incremental changes of a certain value.
 * It consists of a display field, a two segment control and an optional label.
 * Value modificators can be used to make small value changes, e.g for a product in your shopping cart.
 * To prevent the user from doing a lot of taps, value modificators with an additional text edit can be used.
 * <p>
 * Behavior:
 * The value can be changed by tapping on the plus icon (to increase), or on the minus icon (to decrease).
 * The changing value is immediately visible in the display field.
 * A single tap changes the value incrementally.
 * With a long tap, the value changes exponentially.
 * <p>
 * View Attributes:
 * {@link R.styleable#BoschValueModificator_label}:
 * - Label which should be Displayed above Text
 * <p>
 * {@link R.styleable#BoschValueModificator_steps}:
 * - Steps to change the value after touch on plus / minus Button
 * <p>
 * {@link R.styleable#BoschValueModificator_minValue}:
 * - min value
 * <p>
 * {@link R.styleable#BoschValueModificator_maxValue}:
 * - max Value
 * <p>
 * {@link R.styleable#BoschValueModificator_defaultValue}:
 * - Value which is displayed after creating the view
 * <p>
 * {@link R.styleable#BoschValueModificator_decimal}:
 * - True if value should be displayed as decimal
 * <p>
 * {@link R.styleable#BoschValueModificator_enabled}:
 * - True if view should be enabled
 * <p>
 * <p>
 * <p>
 * <p>
 * Public view methods:
 * {@link #getTextField()}
 * <p>
 * {@link #getValue()}
 * <p>
 * {@link #setValue(float)}
 * <p>
 * {@link #setValues(float, float, float, float, boolean)}
 * <p>
 * {@link #getDefaultValue()}
 * <p>
 * {@link #getMinValue()}
 * <p>
 * {@link #getMaxValue()}
 * <p>
 * {@link #getStep()}
 * <p>
 * {@link #isDisplayDecimal()}
 * <p>
 * {@link #getDecimalCount()}
 * <p>
 * {@link #setDecimalPlaces(int)}
 * <p>
 * {@link #setLabel(String)}
 * <p>
 * {@link #setEnabled(boolean)}
 * <p>
 * {@link #setPlusButtonEnabled(boolean)}
 * <p>
 * {@link #setMinusButtonEnabled(boolean)}
 * <p>
 * {@link #isEnabled()}
 * <p>
 * {@link #setOnValueModifiedListener(OnValueModifiedListener)}
 * <p>
 * {@link #showValidation(int)}
 * <p>
 * {@link #showValidation(int, int)}
 * <p>
 * {@link #showValidation(int, String)}
 * <p>
 * {@link #hideValidation()}
 */
public class BoschValueModificator extends LinearLayout implements View.OnTouchListener, View.OnFocusChangeListener {

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

    private BoschTextField mTextField;
    private Button mUp;
    private Button mDown;
    private BoschLabel mValidationText;
    private Drawable mValidationBackground;
    private Handler mTouchHandler;
    private Runnable mTouchHandlerCallback;
    //View Attributes
    private float mDefaultValue;
    private float mMinValue;
    private float mMaxValue;
    private float mStep;
    private boolean mDisplayDecimal;
    private int mDecimalPlaces;
    private boolean mEnabled;

    private OnValueModifiedListener mOnValueModifiedListener;

    public BoschValueModificator(Context context) {
        super(context);
        init(context, null);
    }

    public BoschValueModificator(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    public BoschValueModificator(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }

    public BoschValueModificator(Context context, @Nullable AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
        init(context, attrs);
    }

    /**
     * Initializes the view, reads attributes, defines width of textfield
     * {@link R.styleable#BoschValueModificator_label}:
     * {@link R.styleable#BoschValueModificator_steps}:
     * {@link R.styleable#BoschValueModificator_minValue}:
     * {@link R.styleable#BoschValueModificator_maxValue}:
     * {@link R.styleable#BoschValueModificator_defaultValue}:
     * {@link R.styleable#BoschValueModificator_decimal}:
     * {@link R.styleable#BoschValueModificator_enabled}:
     *
     * @param context
     * @param attrs
     */
    private void init(final Context context, final AttributeSet attrs) {
        initLayout(context);
        if (attrs != null) {
            TypedArray a = context.getTheme().obtainStyledAttributes(
                    attrs,
                    R.styleable.BoschValueModificator,
                    0, 0);
            final String label;
            try {
                this.mStep = a.getFloat(R.styleable.BoschValueModificator_steps, 1);
                this.mDefaultValue = a.getFloat(R.styleable.BoschValueModificator_defaultValue, 0);
                this.mMinValue = a.getFloat(R.styleable.BoschValueModificator_minValue, Float.MIN_VALUE);
                this.mMaxValue = a.getFloat(R.styleable.BoschValueModificator_maxValue, Float.MAX_VALUE);
                this.mDisplayDecimal = a.getBoolean(R.styleable.BoschValueModificator_decimal, false);
                this.mEnabled = a.getBoolean(R.styleable.BoschValueModificator_enabled, true);
                label = a.getString(R.styleable.BoschValueModificator_label);
            } finally {
                a.recycle();
            }
            if (this.mDisplayDecimal) {
                this.mDecimalPlaces = getDecimalCount(this.mDefaultValue, this.mStep);
            }
            if (this.mTextField != null) {
                this.mTextField.setLabel(label);
                updateValue(this.mDefaultValue);
                //Set width of textfield
                this.mTextField.setLongestPossibleText(getMaxValue() + "l");
            }
            setEnabled(this.mEnabled);

        }
    }

    /**
     * Initializes the Layout, gets all the necessary layout components
     *
     * @param context
     */
    private void initLayout(final Context context) {
        inflate(context, R.layout.bosch_value_modificator, this);
        this.mTextField = findViewById(R.id.value_text);
        this.mTextField.setOnFocusChangeListener(this);
        this.mUp = findViewById(R.id.value_up);
        if (this.mUp != null) {
            this.mUp.setOnTouchListener(this);
        }
        this.mDown = findViewById(R.id.value_down);
        if (this.mDown != null) {
            this.mDown.setOnTouchListener(this);
        }
        this.mValidationText = findViewById(R.id.value_error);
        final LinearLayout modLayout = findViewById(R.id.mod_layout);
        if (modLayout != null) {
            mValidationBackground = modLayout.getBackground();
        }
    }

    /**
     * updates the value after user clicked plus / minus Button
     *
     * @param value is negative for minus click and positive for plus click
     */
    private void updateValue(final float value) {
        if (this.mTextField != null) {
            /**
             * calculate new value
             */
            float newValue = calculateNewValue(getCurrentValue(), value);
            if (newValue >= this.mMaxValue) {
                newValue = this.mMaxValue;
            } else if (newValue <= mMinValue) {
                newValue = this.mMinValue;
            }
            if (newValue <= this.mMaxValue && newValue >= this.mMinValue) {
                /**
                 * If decimal is activated show value rounded on {@link #mDecimalPlaces} decimal places
                 */
                final String newValueText = this.mDisplayDecimal
                        ? String.format(Locale.US, "%." + this.mDecimalPlaces + "f", newValue)
                        : String.valueOf(Math.round(newValue));
                this.mTextField.setText(newValueText);
                /**
                 * Call listener to notify that value was changed
                 */
                if (this.mOnValueModifiedListener != null) {
                    this.mOnValueModifiedListener.onValueModified(newValue);
                    this.mOnValueModifiedListener.onValueModified(newValueText);
                }
                /**
                 * enable / disable buttons
                 */
                if (this.mUp != null && this.mDown != null) {
                    if (newValue >= this.mMaxValue) {
                        this.mUp.setEnabled(false);
                        this.mDown.setEnabled(true);
                    } else if (newValue <= this.mMinValue) {
                        this.mDown.setEnabled(false);
                        this.mUp.setEnabled(true);
                    } else {
                        this.mUp.setEnabled(true);
                        this.mDown.setEnabled(true);
                    }
                }
            }
        }
    }

    /**
     * calculates new value depending on
     *
     * @param currentValue {@link #getCurrentValue()}
     * @param stepValue    {@link #getStep()}
     * @return new value
     * <p>
     * if decimal is activated new value is rounded to {@link #mDecimalPlaces} decimal places
     */
    private float calculateNewValue(final float currentValue, final float stepValue) {
        final double factor = Math.pow(10, this.mDecimalPlaces);
        return (float) (Math.round((currentValue + stepValue) * factor) / factor);
    }

    /**
     * @param value1
     * @param value2
     * @return max decimal places count of the two values
     */
    private int getDecimalCount(final float value1, final float value2) {
        final String s1 = String.valueOf(value1);
        final String s2 = String.valueOf(value2);
        final int length1 = s1.substring(s1.indexOf('.')).length() - 1;
        final int length2 = s2.substring(s2.indexOf('.')).length() - 1;
        return length1 > length2 ? length1 : length2;
    }

    /**
     * @return current value of textfield
     */
    private float getCurrentValue() {
        if (this.mTextField != null) {
            final String s = this.mTextField.getText().toString();
            if (!TextUtils.isEmpty(s)) {
                return Float.parseFloat(s);
            }
        }
        return 0;
    }

    @Override
    public boolean onTouch(final View v, MotionEvent event) {
        if (!v.isEnabled()) {
            count(v, false);
            return false;
        }

        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                v.setPressed(true);
                Log.i("TouchTest", "Action Down");
                //click(v, true);
                count(v, true);
                break;
            case MotionEvent.ACTION_UP:
                Log.i("TouchTest", "Action Up");
                click(v);
                count(v, false);
                break;

            case MotionEvent.ACTION_CANCEL:
                Log.i("TouchTest", "Action Cancel");
                count(v, false);
                break;

            default:
                break;
        }
        return true;
    }

    /**
     * calls itself again for long click gesture
     *
     * @param v     View which is pressed
     * @param start true to start, false to end
     */
    private void count(final View v, final boolean start) {
        if (mTouchHandler == null) {
            mTouchHandler = new Handler();
        }
        if (mTouchHandlerCallback == null) {
            mTouchHandlerCallback = new Runnable() {
                @Override
                public void run() {
                    click(v);
                    count(v, v.isEnabled());
                }
            };
        }
        if (start) {
            mTouchHandler.postDelayed(mTouchHandlerCallback, 250);
        } else {
            mTouchHandler.removeCallbacks(mTouchHandlerCallback);
            mTouchHandlerCallback = null;
            mTouchHandler = null;
            v.setPressed(false);
        }
    }

    private void click(final View v) {
        if (v == this.mUp) {
            updateValue(this.mStep);
        } else if (v == this.mDown) {
            updateValue(-this.mStep);
        }
    }

    /**
     * updates the error message
     *
     * @param colorResource
     * @param text
     */
    private void updateErrorMessage(final int colorResource, final String text) {
        if (this.mValidationText != null) {
            this.mValidationText.setVisibility(VISIBLE);
            this.mValidationText.setText(text);
            this.mValidationText.setTextColor(colorResource);
        }
    }

    /**
     * updates the line
     *
     * @param status
     */
    private void updateLine(final int status) {
        if (this.mValidationBackground != null) {
            this.mValidationBackground.setLevel(status);
        }
    }

    /**
     * @return value modificators textfield
     */
    public BoschTextField getTextField() {
        return this.mTextField;
    }

    /**
     * @return the current value the view displays
     */
    public float getValue() {
        return getCurrentValue();
    }

    /**
     * @param value Value which should be displayed
     */
    public void setValue(final float value) {
        if (this.mTextField != null) {
            this.mTextField.setText(String.valueOf(value));
            updateValue(0);
        }
    }

    /**
     * @param defaultValue   value which should be displayed after creating the view
     * @param minValue       minimum value
     * @param maxValue       maximum value
     * @param step           value which should be added / subtracted from current value
     * @param displayDecimal true if the value should be displayed as decimal
     */
    public void setValues(float defaultValue, float minValue, float maxValue, float step, boolean displayDecimal) {
        this.mDefaultValue = defaultValue;
        this.mMinValue = minValue;
        this.mMaxValue = maxValue;
        this.mStep = step;
        this.mDisplayDecimal = displayDecimal;
        if (this.mDisplayDecimal && this.mDecimalPlaces <= 0) {
            this.mDecimalPlaces = getDecimalCount(this.mDefaultValue, this.mStep);
        }
        if (this.mTextField != null) {
            this.mTextField.setText(String.valueOf(this.mDefaultValue));
            updateValue(0);
        }
    }

    /**
     * @return default value
     */
    public float getDefaultValue() {
        return this.mDefaultValue;
    }

    /**
     * @return minimum value
     */
    public float getMinValue() {
        return this.mMinValue;
    }

    /**
     * @return maximum value
     */
    public float getMaxValue() {
        return this.mMaxValue;
    }

    /**
     * @return steps value
     */
    public float getStep() {
        return this.mStep;
    }

    /**
     * @return if view is displaying values as decimal
     */
    public boolean isDisplayDecimal() {
        return this.mDisplayDecimal;
    }

    /**
     * @return number of decimal places
     */
    public int getDecimalCount() {
        return this.mDecimalPlaces;
    }

    /**
     * By default the decimal places are calculated from decimal places of {@link #mDefaultValue} and {@link #mStep}
     *
     * @param decimalPlaces to define how many decimal places should be displayed
     */
    public void setDecimalPlaces(int decimalPlaces) {
        this.mDecimalPlaces = decimalPlaces;
    }

    /**
     * @param label Label which gets displayed over text
     */
    public void setLabel(String label) {
        if (this.mTextField != null) {
            this.mTextField.setLabel(label);
        }
    }

    /**
     * @param enabled Enables or disables the complete view
     */
    public void setEnabled(final boolean enabled) {
        if (this.mTextField != null && this.mUp != null && this.mDown != null) {
            this.mEnabled = enabled;
            this.mTextField.setEnabled(enabled);
            this.mUp.setEnabled(enabled);
            this.mDown.setEnabled(enabled);
        }
    }

    /**
     * @param enabled enables/disables only the plus button, gets automatically disabled when
     *                {@link #getCurrentValue()} is >= {@link #mMaxValue}
     */
    public void setPlusButtonEnabled(final boolean enabled) {
        if (this.mUp != null && mEnabled) {
            this.mUp.setEnabled(enabled);
        }
    }

    /**
     * @param enabled enables/disables only the minus button, gets automatically disabled when
     *                {@link #getCurrentValue()} is <= {@link #mMaxValue}
     */
    public void setMinusButtonEnabled(final boolean enabled) {
        if (this.mDown != null && mEnabled) {
            this.mDown.setEnabled(enabled);
        }
    }

    /**
     * @return if the view is enabled / disabled
     */
    public boolean isEnabled() {
        return this.mEnabled;
    }

    /**
     * @param listener Listener which gets called when {@link #getValue()} has changed
     */
    public void setOnValueModifiedListener(OnValueModifiedListener listener) {
        this.mOnValueModifiedListener = listener;
    }

    /**
     * Shows only colored Line
     *
     * @param status {@link #STATUS_DEFAULT} || {@link #STATUS_OK} || {@link #STATUS_WARNING} || {@link #STATUS_ERROR}
     */
    public void showValidation(final int status) {
        showValidation(status, null);
    }

    /**
     * @param status {@link #STATUS_DEFAULT} || {@link #STATUS_OK} || {@link #STATUS_WARNING} || {@link #STATUS_ERROR}
     * @param textId Resource string id of validation message
     */
    public void showValidation(final int status, final int textId) {
        final Context context = getContext();
        if (context != null) {
            showValidation(status, context.getString(textId));
        }
    }

    /**
     * @param status {@link #STATUS_DEFAULT} || {@link #STATUS_OK} || {@link #STATUS_WARNING} || {@link #STATUS_ERROR}
     * @param text   validation message
     */
    public void showValidation(final int status, final String text) {
        final Context context = getContext();
        if (context != null) {
            switch (status) {
                case STATUS_OK:
                    updateErrorMessage(ContextCompat.getColor(context, R.color.boschLightGreen), text);
                    updateLine(status);
                    break;
                case STATUS_WARNING:
                    updateErrorMessage(ContextCompat.getColor(context, R.color.boschYellow), text);
                    updateLine(status);
                    break;
                case STATUS_ERROR:
                    updateErrorMessage(ContextCompat.getColor(context, R.color.boschRed), text);
                    updateLine(status);
                    break;
                case STATUS_DEFAULT:
                    updateErrorMessage(ContextCompat.getColor(context, R.color.boschLightGray), null);
                    updateLine(status);
            }
        }
    }

    /**
     * hide validation status
     */
    public void hideValidation() {
        final Context context = getContext();
        if (this.mValidationText != null && context != null) {
            this.mValidationText.setVisibility(INVISIBLE);
            updateLine(STATUS_DEFAULT);
        }
    }

    @Override
    public void onFocusChange(final View v, final boolean hasFocus) {
        if (v instanceof BoschTextField && !hasFocus) {
            updateValue(0);
        }
    }

    public interface OnValueModifiedListener {

        void onValueModified(final float newValue);

        void onValueModified(final String newValue);
    }
}
