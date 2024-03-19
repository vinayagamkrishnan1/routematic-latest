package com.bosch.app.lib.widget;

import android.content.Context;
import android.content.res.TypedArray;
import androidx.core.content.res.ResourcesCompat;
import androidx.appcompat.widget.AppCompatTextView;
import android.util.AttributeSet;

import com.bosch.app.lib.R;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 20.11.17.
 */

/**
 * Always use one of the following styles:
 * - {@link R.style#Widget_Bosch_Label_Small} for small texts
 * - {@link R.style#Widget_Bosch_Label_Standard} for normal texts
 * - {@link R.style#Widget_Bosch_Label_Headline} for headlines
 * <p>
 * A label is text that puts control elements in a context or conveys information.
 * A label is usually related to an UI element so that the user knows which function is associated with it.
 * <p>
 * Attributes:
 * {@link R.styleable#BoschLabel_priority}
 * - if priority is set to high, font is bold
 */
public class BoschLabel extends AppCompatTextView {

    public BoschLabel(Context context) {
        super(context);
    }

    public BoschLabel(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    public BoschLabel(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }

    /**
     * Default font style is {@link R.font#bosch_sans_regular}
     *
     * @param context
     * @param attrs
     */
    private void init(final Context context, final AttributeSet attrs) {
        TypedArray a = context.getTheme().obtainStyledAttributes(
                attrs,
                R.styleable.BoschLabel,
                0, 0);
        final int priority;
        try {
            priority = a.getInteger(R.styleable.BoschLabel_priority, 0);
        } finally {
            a.recycle();
        }

        if (priority == 1) {
            this.setTypeface(ResourcesCompat.getFont(context, R.font.bosch_sans_bold));
        }
    }
}
