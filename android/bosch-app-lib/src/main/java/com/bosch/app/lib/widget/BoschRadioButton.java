package com.bosch.app.lib.widget;

import android.content.Context;
import androidx.appcompat.widget.AppCompatRadioButton;
import android.util.AttributeSet;

import com.bosch.app.lib.R;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 13.11.17.
 */

/**
 * Should always be used within a {@link android.widget.RadioGroup} for right behavior
 * <p>
 * Always use with {@link R.style#Widget_Bosch_RadioButton} in xml declaration
 * {@link BoschRadioButton} has the same functionality like androids {@link android.widget.RadioButton}
 * <p>
 * Definition:
 * Radio buttons are selection controls for options, where the selection of a single option from a group of options is required.
 * Like checkboxes, radio buttons always need a label or text to make clear what the option is about. They can also be used within Lists.
 * <p>
 * Usage:
 * <p>
 * Use radio buttons in cases, where a single option needs to be selected (single choice).
 * Alternatively, a Dropdown can be used.
 * Don't use checkboxes for switching smartphone functionalities on or off (See {@link BoschSwitch}).
 * <p>
 * Behavior:
 * A group of radio buttons can only be completely inactive, as long as the user has not selected one of the options.
 * As soon as there was a selection, one option from the group stays active.
 * In contrary to checkboxes, tapping on an active radion button will not deactivate it.
 * In order to change the selection, the user needs to tap on another radio button of the group.
 */
public class BoschRadioButton extends AppCompatRadioButton {

    public BoschRadioButton(Context context) {
        super(context);
    }

    public BoschRadioButton(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public BoschRadioButton(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

}
