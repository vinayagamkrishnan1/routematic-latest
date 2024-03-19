package com.bosch.app.lib.widget;

import android.content.Context;
import android.content.res.Resources;
import android.content.res.TypedArray;
import androidx.appcompat.widget.AppCompatSpinner;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.LinearLayout;
import android.widget.SpinnerAdapter;
import android.widget.TextView;

import com.bosch.app.lib.R;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 21.11.17.
 */

/**
 * Always use {@link R.style#Widget_Bosch_Dropdown} in xml declaration
 * <p>
 * Definition:
 * A dropdown provides several predefined options or values from which the user can choose one.
 * By tapping on the dropdown, it displays a list of available options.
 * The user can select a specific value by tapping on it.
 * <p>
 * Usage:
 * The usage of a dropdown is recommended, when a direct listing of available options would take up a lot of space.
 * In cases of less options, {@link BoschRadioButton} may also be considered.
 * Don't use a dropdown, when multiple options are possible.
 * <p>
 * Behavior:
 * By tapping on the dropdown, it expands and reveals a list of options.
 * The user can select an option by tapping on it.
 * The selected item is displayed in an active state.
 * With a short delay, the dropdown collapses automatically and applies the selected value.
 * <p>
 * Attributes:
 * {@link R.styleable#BoschDropdown_items}
 * - array-list which can be defined in strings resources
 * {@link R.styleable#BoschDropdown_enabled}
 * - True if view is enabled
 * {@link R.styleable#BoschDropdown_label}
 * - Label over dropdown text
 * <p>
 * Public view methods:
 * {@link #setItems(ArrayList)}
 * <p>
 * {@link #setLabel(String)}
 */
public class BoschDropdown extends AppCompatSpinner implements View.OnTouchListener {

    private BoschDropdownAdapter mAdapter;
    private boolean mDialogVisible;

    public BoschDropdown(Context context) {
        super(context);
        init(context, null);
    }

    public BoschDropdown(Context context, int mode) {
        super(context, mode);
        init(context, null);
    }

    public BoschDropdown(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    public BoschDropdown(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }

    public BoschDropdown(Context context, AttributeSet attrs, int defStyleAttr, int mode) {
        super(context, attrs, defStyleAttr, mode);
        init(context, attrs);
    }

    public BoschDropdown(Context context, AttributeSet attrs, int defStyleAttr, int mode, Resources.Theme popupTheme) {
        super(context, attrs, defStyleAttr, mode, popupTheme);
        init(context, attrs);
    }

    /**
     * init Dropdown and get attributes which were defined in xml
     *
     * @param context
     * @param attrs
     */
    private void init(final Context context, final AttributeSet attrs) {
        this.mAdapter = new BoschDropdownAdapter(context);
        if (attrs != null) {
            TypedArray a = context.getTheme().obtainStyledAttributes(
                    attrs,
                    R.styleable.BoschDropdown,
                    0, 0);
            final ArrayList<String> items;
            final CharSequence[] array;
            final String label;
            final boolean enabled;
            try {
                array = a.getTextArray(R.styleable.BoschDropdown_items);
                label = a.getString(R.styleable.BoschDropdown_label);
                enabled = a.getBoolean(R.styleable.BoschDropdown_enabled, true);
            } finally {
                a.recycle();
            }
            if (array != null && array.length > 0) {
                items = new ArrayList<>();
                List<CharSequence> list = Arrays.asList(array);
                for (CharSequence c : list) {
                    items.add(c.toString());
                }
                setItems(items);
            }
            setLabel(label);
            setEnabled(enabled);
        }
        this.mAdapter.setMinWidth(getMinimumWidth());
    }

    /**
     * Dialog opens
     *
     * @return
     */
    @Override
    public boolean performClick() {
        this.mDialogVisible = true;
        onOpen();
        return super.performClick();
    }

    /**
     * when dialog is visible and hasFocus dialog switches from visible dialog to closed dialog
     *
     * @param hasFocus
     */
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        if (this.mDialogVisible && hasFocus) {
            onClose();
        }
    }

    /**
     * prepare and show blurView when dropdown is clicked and dialog opens
     */
    private void onOpen() {
        setActivated(true);
    }

    /**
     * hide blurView when dropdown is clicked, e.g. when user clicks outside of dialog or back button
     */
    private void onClose() {
        setActivated(false);
    }

    @Override
    public boolean onTouch(View v, MotionEvent event) {
        if (event.getAction() == MotionEvent.ACTION_UP) {
            onOpen();
        }
        return false;
    }

    /**
     * sets the dropdown items which should be displayed in dropdown list
     *
     * @param items
     */
    public void setItems(final ArrayList<String> items) {
        if (this.mAdapter != null) {
            this.mAdapter.setItems(items);
            setAdapter(this.mAdapter);
        }
    }

    /**
     * sets the label
     *
     * @param label
     */
    public void setLabel(final String label) {
        if (this.mAdapter != null) {
            this.mAdapter.setLabel(label);
        }
    }

    /**
     * Adapter which creates custom view layout for closed dropdown, opened dialog and dialog list items
     */
    private class BoschDropdownAdapter extends BaseAdapter implements SpinnerAdapter {

        private ArrayList<String> mItems;
        private LayoutInflater mInflater;
        private int mMinWidth = -1;
        private boolean calcMinWidth = true;
        private String mLabel;
        private int mPadding;

        public BoschDropdownAdapter(Context context) {
            this(context, null);
        }

        public BoschDropdownAdapter(Context context, ArrayList<String> items) {
            this.mItems = items;
            this.mInflater = LayoutInflater.from(context);
            final Resources res = context.getResources();
            if (res != null) {
                mPadding = (int) res.getDimension(R.dimen.lu);
            }
        }

        /**
         * set dropdown items
         *
         * @param items
         */
        public void setItems(final ArrayList<String> items) {
            this.mItems = items;
        }

        /**
         * sets label
         *
         * @param label
         */
        public void setLabel(String label) {
            this.mLabel = label;
        }

        /**
         * sets minimum width
         *
         * @param width
         */
        void setMinWidth(final int width) {
            this.mMinWidth = width;
        }

        /**
         * returns count of items
         *
         * @return
         */
        public int getCount() {
            if (this.mItems != null) {
                return this.mItems.size();
            }
            return -1;
        }

        /**
         * returns item from
         *
         * @param position
         * @return
         */
        public String getItem(int position) {
            if (this.mItems != null) {
                return this.mItems.get(position);
            }
            return "";
        }

        public long getItemId(int position) {
            return (long) position;
        }

        /**
         * Creates the list item view
         *
         * @param position
         * @param convertView
         * @param parent
         * @return
         */
        @Override
        public View getDropDownView(int position, View convertView, ViewGroup parent) {
            if (parent != null && this.mInflater != null) {
                parent.setPadding(this.mPadding, this.mPadding, this.mPadding, this.mPadding);
                BoschLabel txt = (BoschLabel) this.mInflater.inflate(R.layout.bosch_dropdown_item, parent, false);
                txt.setText(getItem(position));
                return txt;
            }
            return convertView;
        }

        /**
         * creates the dropdown view when dropdown is closed
         *
         * @param position
         * @param view
         * @param viewgroup
         * @return
         */
        @Override
        public View getView(int position, View view, ViewGroup viewgroup) {
            if (this.mInflater != null) {
                final LinearLayout layout = (LinearLayout) this.mInflater.inflate(R.layout.bosch_dropdown, viewgroup, false);
                final BoschLabel textView = (BoschLabel) layout.findViewById(R.id.dropdownText);
                final BoschLabel label = (BoschLabel) layout.findViewById(R.id.dropdownLabel);
                if (textView != null) {
                    textView.setMinWidth(getMinWidth(textView));
                    textView.setText(getItem(position));
                }
                if (label != null) {
                    if (!TextUtils.isEmpty(this.mLabel)) {
                        label.setVisibility(View.VISIBLE);
                        label.setText(this.mLabel);
                    } else {
                        label.setVisibility(View.GONE);
                    }
                }
                return layout;
            }
            return view;
        }

        /**
         * returns the minimum width for the dropdown view (depends on longest text in dropdown items)
         *
         * @param textView
         * @return
         */
        private int getMinWidth(final TextView textView) {
            if (this.calcMinWidth) {
                this.calcMinWidth = false;
                for (String s : this.mItems) {
                    textView.setText(s);
                    textView.measure(0, 0);
                    final int w = textView.getMeasuredWidth();
                    this.mMinWidth = w > this.mMinWidth ? w : this.mMinWidth;
                }
            }
            return this.mMinWidth;
        }
    }

}
