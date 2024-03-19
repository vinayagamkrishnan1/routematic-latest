package com.bosch.app.lib.widget;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.res.Resources;
import android.graphics.Point;
import android.graphics.Rect;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.appcompat.widget.ListPopupWindow;
import android.text.TextUtils;
import android.view.Display;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;

import com.bosch.app.lib.R;

import java.util.ArrayList;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 14.12.17.
 */

/**
 * Can only be used with a list of {@link BoschMenuItem}
 * <p>
 * Definition:
 * A menu provides a list of choices related to the context that is currently displayed.
 * The may also be used in cases, where there is not enough space to display all options on the screen, e.g. in the header.
 * Menus can appear upon interaction with a button, action, list item, or other control.
 * <p>
 * Menu items may cause an action or link to another screen.
 * They may also contain simple controls such as checkboxes, radio buttons, or switches.
 * For usage of these elements please note the referring chapter.
 * <p>
 * Menu items may be disabled if not applicable to a certain context.
 * Contextual menus dynamically change their available menu items based on the current state of the app.
 * <p>
 * Public view methods:
 * {@link #BoschMenu(Context, View)}
 * <p>
 * {@link #BoschMenu(Context, View, int)}
 * <p>
 * {@link #setMenuItems(ArrayList)}
 * <p>
 * {@link #setType(int)}
 * <p>
 * {@link #show()}
 */
public class BoschMenu extends ListPopupWindow implements AdapterView.OnItemClickListener {

    private static final int TYPE_DEFAULT = -1;
    public static final int TYPE_ARROW = 0;
    public static final int TYPE_CHECKBOX = 1;
    public static final int TYPE_RADIO = 2;
    public static final int TYPE_SWITCH = 3;

    private Context mContext;
    private BoschMenuAdapter mAdapter;
    private int mType = TYPE_DEFAULT;
    private int mOffset;
    private Rect mAnchorRect;
    private int mScreenHeight;
    private int mScreenWidth;
    private AdapterView.OnItemClickListener mListener;

    /**
     * When using this constructor View Type of List is Default
     *
     * @param context
     * @param anchor  where menu is positioned, always on top right corner of anchor
     */
    public BoschMenu(@NonNull Context context, final View anchor) {
        this(context, anchor, TYPE_DEFAULT);
    }

    /**
     * @param context
     * @param anchor
     * @param type    Type of menu items, if arrow, radio button, checkbox or switch should be displayed
     */
    public BoschMenu(@NonNull Context context, final View anchor, final int type) {
        super(context, null, 0, R.style.Widget_Bosch_Menu);
        if (context != null && anchor != null) {
            this.mContext = context;
            this.setAnchorView(anchor);
            init(context, anchor);
        }
        this.mType = type;
    }

    @SuppressLint("RestrictedApi")
    private void init(final Context context, final View anchor) {
        setContentWidth(WRAP_CONTENT);
        setWidth(WRAP_CONTENT);
        setHeight(WRAP_CONTENT);
        setListSelector(ContextCompat.getDrawable(mContext, android.R.color.transparent));
        setForceIgnoreOutsideTouch(false);
        setDropDownGravity(Gravity.END);
        setOverlapAnchor(true);
        //Offset
        final Resources res = context.getResources();
        if (res != null) {
            this.mOffset = (int) res.getDimension(R.dimen.gu);
            final int[] location = new int[2];
            anchor.getLocationOnScreen(location);
            this.mAnchorRect = new Rect(location[0], location[1], location[0] + anchor.getWidth(), location[1]
                    + anchor.getHeight());

            WindowManager wm = (WindowManager) this.mContext.getSystemService(Context.WINDOW_SERVICE);
            Display display = wm.getDefaultDisplay();
            Point size = new Point();
            display.getRealSize(size);

            this.mScreenWidth = size.x;
            this.mScreenHeight = size.y;
        }
        setOnItemClickListener(this);
    }

    /**
     * Set the Menu Items {@link BoschMenuItem}
     *
     * @param items
     */
    public void setMenuItems(final ArrayList<BoschMenuItem> items) {
        if (this.mContext != null) {
            this.mAdapter = new BoschMenuAdapter(this.mContext, items, this.mType);
            setAdapter(this.mAdapter);
        }
    }

    /**
     * Set the Type
     *
     * @param type
     */
    public void setType(final int type) {
        this.mType = type;
    }

    /**
     * Shows the menu
     */
    @Override
    public void show() {
        measureContentWidthAndHeight();
        super.show();
    }

    /**
     * Measure width and height, otherwise it some parts are cut off
     */
    private void measureContentWidthAndHeight() {
        if (this.mAdapter != null) {

            int maxWidth = getWidth();
            int maxHeight = 0;
            View itemView = null;
            int itemType = 0;

            final int widthMeasureSpec = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED);
            final int heightMeasureSpec = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED);
            final int count = this.mAdapter.getCount();
            for (int i = 0; i < count; i++) {
                final int positionType = this.mAdapter.getItemViewType(i);
                if (positionType != itemType) {
                    itemType = positionType;
                    itemView = null;
                }

                itemView = this.mAdapter.getView(i, itemView, null);
                if (itemView != null) {
                    itemView.measure(widthMeasureSpec, heightMeasureSpec);

                    final int itemWidth = itemView.getMeasuredWidth();
                    final int itemHeight = itemView.getMeasuredHeight();

                    if (itemWidth > maxWidth) {
                        maxWidth = itemWidth;
                    }
                    maxHeight += itemHeight;
                }
            }
            setWidth(maxWidth);
            setHeight(maxHeight);
            if (this.mAnchorRect != null) {
                if (this.mAnchorRect.top + maxHeight >= this.mScreenHeight) {
                    setVerticalOffset(this.mAnchorRect.height());
                }
                if (this.mAnchorRect.right >= this.mScreenWidth) {
                    setHorizontalOffset(-this.mOffset);
                }
                if (this.mAnchorRect.left <= 0) {
                    setHorizontalOffset(this.mOffset);
                }
            }
        }
    }

    @Override
    public void setOnItemClickListener(@Nullable AdapterView.OnItemClickListener clickListener) {
        if (clickListener != this) {
            this.mListener = clickListener;
        }
        super.setOnItemClickListener(clickListener);

    }

    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
        if (parent != null) {
            final Object item = parent.getItemAtPosition(position);
            if (item instanceof BoschMenuItem) {
                if (((BoschMenuItem) item).getSubMenu() != null) {
                    BoschMenu.this.setMenuItems(((BoschMenuItem) item).getSubMenu());
                    postShow();
                } else if (BoschMenu.this.mListener != null) {
                    this.mListener.onItemClick(parent, view, position, id);
                }
            }
        }
    }

    /**
     * Adapter to create custom views
     */
    private class BoschMenuAdapter extends ArrayAdapter<BoschMenuItem> {

        private LayoutInflater mInflater;
        private int mType;

        public BoschMenuAdapter(Context context, ArrayList<BoschMenuItem> menuItems, int type) {
            super(context, 0, menuItems);
            this.mInflater = LayoutInflater.from(context);
            this.mType = type;
        }

        @Override
        public View getView(final int position, View convertView, final ViewGroup parent) {

            final BoschMenuItem item = getItem(position);
            if (item != null) {
                if (this.mInflater == null) {
                    this.mInflater = LayoutInflater.from(getContext());
                }
                if (this.mInflater != null) {
                    if (convertView == null) {
                        convertView = this.mInflater.inflate(R.layout.bosch_menu_item, parent, false);
                    }
                    final BoschImageView icon = convertView.findViewById(R.id.menu_icon);
                    final BoschLabel text = convertView.findViewById(R.id.menu_text);
                    final BoschImageView arrow = convertView.findViewById(R.id.menu_arrow);
                    if (item.getIcon() != -1) {
                        icon.setVisibility(View.VISIBLE);
                        text.setPadding(0, 0, text.getPaddingRight(), 0);
                        icon.setImageResource(item.getIcon());
                    } else {
                        icon.setVisibility(View.GONE);
                    }
                    if (!TextUtils.isEmpty(item.getTitle())) {
                        text.setVisibility(View.VISIBLE);
                        text.setText(item.getTitle());
                    } else {
                        text.setVisibility(View.GONE);
                    }
                    if (item.getSubMenu() != null) {
                        arrow.setVisibility(View.VISIBLE);
                    } else {
                        arrow.setVisibility(View.GONE);
                    }
                }
            }
            return convertView;
        }
    }

    /**
     * Interface which must be implemented in your menu model
     * <p>
     * getTitle() should be null or empty when no title should be displayed
     * <p>
     * getIcon() should be -1 when no icon should be displayed
     * <p>
     * getSubMenu() should be null when no submenu is needed
     */
    public interface BoschMenuItem {

        String getTitle();

        //Returns the icon which is displayed on the left
        int getIcon();

        //Submenu
        ArrayList<BoschMenuItem> getSubMenu();

    }
}