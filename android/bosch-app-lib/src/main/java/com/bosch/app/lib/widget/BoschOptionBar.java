package com.bosch.app.lib.widget;

import android.content.Context;
import androidx.annotation.Nullable;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;

import com.bosch.app.lib.R;

import java.util.List;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 30.11.17.
 */

/**
 * Always use {@link R.style#Widget_Bosch_OptionBar} in xml declaration
 * <p>
 * Can only be used with a list of {@link BoschOptionBarItem}
 * <p>
 * Use {@link OnOptionBarClickListener} to get notified when a new item is selected
 * <p>
 * Definition:
 * An option bar is a linear set of two or more items, each of which functions as a mutually exclusive button.
 * Each item can contain text or icons, or both. Option bars can be used to display different views, e.g. in a map.
 * They may also be applicable in cases, where the user has to select a certain option (instead of radio buttons).
 * <p>
 * In contrast to the Sub Navigation Bar, an option bar effects the current view instead of switching to another view.
 * <p>
 * Public view methods:
 * {@link #setOptions(List)}
 * <p>
 * {@link #setOptionsEnabled(boolean)}
 * <p>
 * {@link #activateOption(int)}
 * <p>
 * {@link #getItemCount()}
 * <p>
 * {@link #setOptionBarClickListener(OnOptionBarClickListener)}
 */
public class BoschOptionBar extends LinearLayout {

    private LayoutInflater mLayoutInflater;
    private OnOptionBarClickListener mOptionBarClickListener;


    public BoschOptionBar(Context context) {
        super(context);
        init(context);
    }

    public BoschOptionBar(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public BoschOptionBar(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    public BoschOptionBar(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
        init(context);
    }

    private void init(final Context context) {
        mLayoutInflater = LayoutInflater.from(context);
        setOrientation(HORIZONTAL);
        setDuplicateParentStateEnabled(true);
    }

    /**
     * creates the view with items, first item is always selected by default
     *
     * @param items list of {@link BoschOptionBarItem}
     */
    public void setOptions(final List<BoschOptionBarItem> items) {
        if (mLayoutInflater != null && items != null && !items.isEmpty()) {
            View optionView;
            BoschImageView optionIcon;
            BoschLabel optionText;
            for (BoschOptionBarItem item : items) {
                optionView = mLayoutInflater.inflate(R.layout.bosch_option_bar_item, this, false);
                if (optionView != null) {
                    optionIcon = optionView.findViewById(R.id.optionIcon);
                    optionText = optionView.findViewById(R.id.optionText);
                    if (optionIcon != null && optionText != null) {
                        if (item.getIcon() != -1) {
                            optionIcon.setImageResource(item.getIcon());
                        } else {
                            final int textPadding = optionView.getPaddingRight();
                            optionView.setPadding(textPadding, 0, textPadding, 0);
                            optionIcon.setVisibility(GONE);
                        }
                        if (!TextUtils.isEmpty(item.getOption())) {
                            optionText.setText(item.getOption());
                        } else {
                            final int iconPadding = optionView.getPaddingLeft();
                            optionView.setPadding(iconPadding, 0, iconPadding, 0);
                            optionIcon.setPadding(0, 0, 0, 0);
                            optionText.setVisibility(GONE);
                        }
                        optionView.setTag(R.string.option_bar_position, (Integer) items.indexOf(item));
                        optionView.setTag(R.string.option_bar_text, item.getOption());
                        optionView.setOnClickListener(new OnClickListener() {
                            @Override
                            public void onClick(View v) {
                                deselectOptions();
                                v.setActivated(true);
                                if (mOptionBarClickListener != null) {
                                    final int index;
                                    if (v.getTag(R.string.option_bar_position) instanceof Integer) {
                                        index = (int) v.getTag(R.string.option_bar_position);
                                    } else {
                                        index = -1;
                                    }
                                    final String option;
                                    if (v.getTag(R.string.option_bar_text) instanceof String) {
                                        option = (String) v.getTag(R.string.option_bar_text);
                                    } else {
                                        option = null;
                                    }
                                    mOptionBarClickListener.onItemSelected(BoschOptionBar.this, index, option);
                                }
                            }
                        });
                        addView(optionView);
                    }
                }
            }
            activateOption(0);
        }
    }

    /**
     * deselects every option
     */
    private void deselectOptions() {
        for (int i = 0; i < getChildCount(); i++) {
            final View view = getChildAt(i);
            if (view != null) {
                view.setActivated(false);
            }
        }
    }

    /**
     * Enables or disables complete view
     *
     * @param enabled
     */
    public void setOptionsEnabled(final boolean enabled) {
        BoschLabel text;
        BoschImageView icon;
        BoschDivider divider;
        for (int i = 0; i < getChildCount(); i++) {
            final View view = getChildAt(i);
            if (view != null) {
                view.setEnabled(enabled);
                text = view.findViewById(R.id.optionText);
                icon = view.findViewById(R.id.optionIcon);
                divider = view.findViewById(R.id.optionLine);
                if (text != null) {
                    text.setEnabled(enabled);
                }
                if (icon != null) {
                    icon.setEnabled(enabled);
                }
                if (divider != null) {
                    divider.setEnabled(enabled);
                }
            }
        }
    }

    /**
     * Selects item at
     *
     * @param position
     */
    public void activateOption(final int position) {
        final View view = getChildAt(position);
        if (view != null) {
            deselectOptions();
            view.setActivated(true);
        }
    }

    /**
     * @return count of view items
     */
    public int getItemCount() {
        return getChildCount();
    }

    /**
     * @param listener Listener {@link OnOptionBarClickListener} to notify you when items have changed
     */
    public void setOptionBarClickListener(final OnOptionBarClickListener listener) {
        mOptionBarClickListener = listener;
    }


    /**
     * Listener to get feedback when user clicked an item
     */
    public interface OnOptionBarClickListener {

        void onItemSelected(final View view, final int position, final String option);

    }

    /**
     * Interface which must be implemented in your item model
     * Is necessary to create this view
     *
     * getIcon() should return -1 when no icon should be displayed
     *
     * getOption() should be null or empty when no text should be displayed
     */
    public interface BoschOptionBarItem {

        int getIcon();

        String getOption();

    }

}
