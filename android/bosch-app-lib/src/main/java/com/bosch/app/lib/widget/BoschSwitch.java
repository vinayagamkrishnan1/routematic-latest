package com.bosch.app.lib.widget;

import android.content.Context;
import androidx.core.content.res.ResourcesCompat;
import androidx.appcompat.widget.SwitchCompat;
import android.util.AttributeSet;

import com.bosch.app.lib.R;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 14.11.17.
 */

/**
 * Always use {@link R.style#Widget_Bosch_Switch} in xml declaration
 * {@link BoschSwitch} has the same functionality like androids {@link SwitchCompat}
 * <p>
 * Definition:
 * A switch is a selection element that allows the user to control a certain app
 * or device functionality using the analogy of a physical switch. By tapping on a switch,
 * it toggles between two states, e.g Wifi on and Wifi off.
 * In contrast to checkbox and radio button, it does not require a group of elements.
 * <p>
 * A switch always needs a label with a short and clear description of the corresponding functionality.
 * The label should be positioned in line with the switch.
 * <p>
 * Usage:
 * Use a switch for any functionality that is either turned on or off and is effecting the
 * behavior of an app by using device functionalities such as bluetooth, mobile internet, notifications, sounds, or display settings.
 * Provide a clear description of the functionality using a Label. Never use verbs (switch...) or a status (... on)
 * in the label to avoid confusion. Switches can also be used within a list, e.g. on setting screens.
 * For further information see description of Lists.
 * <p>
 */
public class BoschSwitch extends SwitchCompat {

    public BoschSwitch(Context context) {
        super(context);
        init(context);
    }

    public BoschSwitch(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public BoschSwitch(Context context, AttributeSet attrs, int defStyleAttr) {
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
