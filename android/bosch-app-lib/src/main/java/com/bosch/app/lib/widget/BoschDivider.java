package com.bosch.app.lib.widget;

import android.content.Context;
import android.content.res.Resources;
import androidx.annotation.Nullable;
import android.util.AttributeSet;
import android.view.View;

import com.bosch.app.lib.R;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 14.11.17.
 */

/**
 * A divider is a thin line, used to visually separate the content of an app.
 * Dividers clarify the connection of different elements and help to organize and structure the contents, e.g. in a list.
 */
public class BoschDivider extends View {

    private int mHeight;

    public BoschDivider(Context context) {
        this(context, null);
    }

    public BoschDivider(Context context, @Nullable AttributeSet attrs) {
        this(context, attrs, 0, R.style.Widget_Bosch_Divider);
    }

    public BoschDivider(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        this(context, attrs, defStyleAttr, R.style.Widget_Bosch_Divider);
    }

    public BoschDivider(Context context, @Nullable AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
        init(context);
    }

    /**
     * gets height of view from resources
     * @param context
     */
    private void init(final Context context) {
        final Resources res = context.getResources();
        if (res != null) {
            this.mHeight = (int) res.getDimension(R.dimen.lu);
        }
    }

    /**
     * sets automatically the maximum height of {@link R.dimen#gu1_5} so it need'nt be declared every time in xml
     * @param widthMeasureSpec
     * @param heightMeasureSpec
     */
    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        super.onMeasure(widthMeasureSpec, this.mHeight);
    }
}
