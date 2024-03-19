package com.bosch.app.lib.widget;

import android.content.Context;
import androidx.annotation.Nullable;
import android.util.AttributeSet;
import android.widget.FrameLayout;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 15.12.17.
 */

/**
 * Creates Square Layout which is used in {@link BoschGalleryView}
 */
public class BoschGalleryItemLayout extends FrameLayout {

    public BoschGalleryItemLayout(Context context) {
        super(context);
    }

    public BoschGalleryItemLayout(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
    }

    public BoschGalleryItemLayout(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    public BoschGalleryItemLayout(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        // Set a square layout.
        super.onMeasure(widthMeasureSpec, widthMeasureSpec);
    }
}
