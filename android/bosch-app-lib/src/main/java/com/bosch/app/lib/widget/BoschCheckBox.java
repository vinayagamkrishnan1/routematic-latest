package com.bosch.app.lib.widget;

import android.content.Context;
import androidx.core.content.res.ResourcesCompat;
import androidx.appcompat.widget.AppCompatCheckBox;
import android.util.AttributeSet;

import com.bosch.app.lib.R;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 14.11.17.
 */

/**
 * Always use {@link R.style#Widget_Bosch_CheckBox} in xml declaration
 * {@link BoschCheckBox} has the same functionality like androids {@link android.widget.CheckBox}
 * <p>
 * Definition:
 * Checkboxes are selection controls that allow the selection of multiple options from a group.
 * By tapping on the checkbox, the referring option can be activated or deactivated.
 * Checkboxes always require a description of the option.
 * This can either be a label or text, e.g. "I accept the General Terms and Conditions".
 * They can also be integrated within a list.
 * <p>
 * Usage:
 * Use checkboxes in cases, where several options can be selected independently from each other.
 * Don't use checkboxes for switching smartphone functionalities on or off (See {@link BoschSwitch})
 * or in cases where options are mutually exclusive (See {@link BoschRadioButton})
 */
public class BoschCheckBox extends AppCompatCheckBox {

    public BoschCheckBox(Context context) {
        super(context);
        init(context);
    }

    public BoschCheckBox(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public BoschCheckBox(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    /**
     * Workaround, because setting fontFamily through xml is not working yet for checkboxes
     * https://issuetracker.google.com/issues/63250768
     *
     * @param context
     */
    private void init(final Context context) {
        if (context != null) {
            setTypeface(ResourcesCompat.getFont(context, R.font.bosch_sans_regular));
        }
    }
}
