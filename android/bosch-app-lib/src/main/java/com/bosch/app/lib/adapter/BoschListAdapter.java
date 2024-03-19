package com.bosch.app.lib.adapter;

import android.content.Context;
import android.content.res.Resources;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CompoundButton;
import android.widget.LinearLayout;

import com.bosch.app.lib.R;
import com.bosch.app.lib.widget.BoschCheckBox;
import com.bosch.app.lib.widget.BoschImageView;
import com.bosch.app.lib.widget.BoschLabel;
import com.bosch.app.lib.widget.BoschListView;
import com.bosch.app.lib.widget.BoschMenu;
import com.bosch.app.lib.widget.BoschPopover;
import com.bosch.app.lib.widget.BoschRadioButton;
import com.bosch.app.lib.widget.BoschSwitch;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 15.12.17.
 */

/**
 * Adapter for {@link BoschListView}
 * Needs {@link BoschListItem}
 * Click Callbacks can be received with {@link OnBoschListItemClickedListener}
 */
public class BoschListAdapter extends RecyclerView.Adapter<BoschListAdapter.ViewHolder> implements
        BoschStickyHeaderAdapter<BoschListAdapter.HeaderHolder> {

    public final static int VIEW_TYPE_ITEM = 0;
    public final static int VIEW_TYPE_SUB_ITEM = 1;

    private LayoutInflater mInflater;
    private List<BoschListItem> mItemList;
    private boolean mHasSections;
    private OnBoschListItemClickedListener mBoschListItemClickListener;
    private int mGu6;
    private int mGu8;

    public BoschListAdapter(List<BoschListItem> itemList, Context context) {
        this(itemList, context, false);
    }

    public BoschListAdapter(List<BoschListItem> itemList, Context context, boolean hasSections) {
        this(itemList, context, hasSections, null);
    }

    public BoschListAdapter(List<BoschListItem> itemList, Context context, OnBoschListItemClickedListener listener) {
        this(itemList, context, false, listener);
    }

    public BoschListAdapter(List<BoschListItem> itemList, Context context, boolean hasSections, OnBoschListItemClickedListener listener) {
        this.mInflater = LayoutInflater.from(context);
        this.mItemList = itemList;
        this.mHasSections = hasSections;
        this.mBoschListItemClickListener = listener;
        final Resources res = context.getResources();
        if (res != null) {
            this.mGu6 = (int) res.getDimension(R.dimen.gu6);
            this.mGu8 = (int) res.getDimension(R.dimen.gu8);
        }
    }

    public void setBoschListItemClickListener(final OnBoschListItemClickedListener listener) {
        this.mBoschListItemClickListener = listener;
    }

    protected int getItemPosition(final BoschListItem item) {
        return this.mItemList != null ? this.mItemList.indexOf(item) : -1;
    }

    public BoschListItem getItem(int position) {
        return this.mItemList != null && position < this.mItemList.size() && position >= 0 ? this.mItemList.get(position) : null;
    }

    @Override
    public int getItemCount() {
        return this.mItemList != null ? this.mItemList.size() : 0;
    }

    @Override
    public BoschListAdapter.HeaderHolder onCreateHeaderViewHolder(ViewGroup parent) {
        final View view = this.mInflater.inflate(R.layout.bosch_list_header, parent, false);
        return new HeaderHolder(view);
    }

    @Override
    public long getHeaderId(int position) {
        final BoschListItem model = getItem(position);
        if (model != null) {
            final String section = model.getSection();
            if (!TextUtils.isEmpty(section)) {
                return section.hashCode();
            }
        }
        return 0;
    }

    /**
     * @return if {@link BoschListView}should contain section header
     */
    @Override
    public boolean hasHeaders() {
        return mHasSections;
    }

    /**
     * Adds the section header
     *
     * @param viewholder the header view holder
     * @param position   the header's item position
     */
    @Override
    public void onBindHeaderViewHolder(BoschListAdapter.HeaderHolder viewholder, int position) {
        final BoschListItem model = getItem(position);
        if (model != null) {
            final String section = model.getSection();
            if (!TextUtils.isEmpty(section)) {
                viewholder.header.setText(section);
            }
        }
    }

    @Override
    public int getItemViewType(final int position) {
        return getItemViewType(getItem(position));
    }

    /**
     * decides if item is item or sub-item
     *
     * @param item
     * @return
     */
    public int getItemViewType(BoschListItem item) {
        if (item != null && item.isSubItem()) {
            return VIEW_TYPE_SUB_ITEM;
        }
        return VIEW_TYPE_ITEM;
    }

    /**
     * returns layout depending on item type {@link #getItemViewType(int)}
     *
     * @param parent
     * @param viewType
     * @return {@link ViewHolder} or {@link ChildViewHolder}
     */
    @Override
    public BoschListAdapter.ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        if (viewType == VIEW_TYPE_ITEM) {
            final View view = this.mInflater.inflate(R.layout.bosch_list_item, parent, false);
            return new BoschListAdapter.ViewHolder(view);
        } else {
            final View view = this.mInflater.inflate(R.layout.bosch_list_subitem, parent, false);
            return new BoschListAdapter.ChildViewHolder(view);
        }
    }

    /**
     * sets title and subtitle of view -> {@link #initView(BoschListItem, ViewHolder)}
     * sets the icon on the left side -> {@link #setIconLeft(BoschListItem, ViewHolder)}
     * sets the status -> {@link #initStatus(BoschListItem, ViewHolder)}
     * adds icon right, checkbox, switch or radio button depending on {@link BoschListItem#getType()}
     * - {@link #initDefault(BoschListItem, ViewHolder)}
     * - {@link #initRadioButton(BoschListItem, ViewHolder)}
     * - {@link #initCheckbox(BoschListItem, ViewHolder)}
     * - {@link #initSwitch(BoschListItem, ViewHolder)}
     * <p>
     * sets {@link android.view.View.OnClickListener}
     * if view has {@link BoschListItem#getAccordionItems()} the items are shown or hidden under the item,
     * otherwise {@link OnBoschListItemClickedListener#onListItemClicked(BoschListItem)} is called
     * <p>
     * check if view is enabled, if not it gets grayed out
     *
     * @param holder
     * @param position
     */
    @Override
    public void onBindViewHolder(final BoschListAdapter.ViewHolder holder, final int position) {
        final BoschListItem item = getItem(position);
        if (item != null) {
            //Title and subtitle
            initView(item, holder);
            if (!item.isSubItem()) {
                //Icon Left
                setIconLeft(item, holder);
                //Status
                initStatus(item, holder);
                //Different Types
                final int type = item.getType();
                if (type == BoschListItem.TYPE_DEFAULT) {
                    initDefault(item, holder);
                } else if (type == BoschListItem.TYPE_RADIO_BUTTON) {
                    initRadioButton(item, holder);
                } else if (type == BoschListItem.TYPE_SWITCH) {
                    initSwitch(item, holder);
                } else if (type == BoschListItem.TYPE_CHECKBOX) {
                    initCheckbox(item, holder);
                }
            }
            holder.mView.setOnTouchListener(new View.OnTouchListener() {
                @Override
                public boolean onTouch(final View v, final MotionEvent event) {
                    if (!v.isEnabled() || !item.isEnabled()) {
                        return false;
                    }
                    final int type = item.getType();
                    final int position = getItemPosition(item);
                    switch (event.getAction()) {
                        case MotionEvent.ACTION_DOWN:
                            if (type == BoschListItem.TYPE_RADIO_BUTTON) {
                                holder.mRadioButton.setPressed(true);
                            } else if (type == BoschListItem.TYPE_CHECKBOX) {
                                holder.mCheckbox.setPressed(true);
                            }
                            v.setPressed(true);
                            notifyItemChanged(position);
                            break;
                        case MotionEvent.ACTION_UP:
                            if (type == BoschListItem.TYPE_RADIO_BUTTON) {
                                holder.mRadioButton.setPressed(false);
                            } else if (type == BoschListItem.TYPE_CHECKBOX) {
                                holder.mCheckbox.setPressed(false);
                            }
                            v.setPressed(false);
                            notifyItemChanged(position);
                            v.callOnClick();
                            onItemClick(holder, item);
                            break;

                        case MotionEvent.ACTION_CANCEL:
                            if (type == BoschListItem.TYPE_RADIO_BUTTON) {
                                holder.mRadioButton.setPressed(false);
                            } else if (type == BoschListItem.TYPE_CHECKBOX) {
                                holder.mCheckbox.setPressed(false);
                            }
                            v.setPressed(false);
                            notifyItemChanged(position);
                            break;

                        default:
                            break;
                    }
                    return true;
                }
            });
            holder.mView.setEnabled(item.isEnabled());
        }
    }

    private void onItemClick(final ViewHolder holder, final BoschListItem item) {
        final int type = item.getType();
        if (type == BoschListItem.TYPE_RADIO_BUTTON) {
            checkRadioButton(item);
        } else if (type == BoschListItem.TYPE_CHECKBOX) {
            item.setCheckboxChecked(!item.isCheckboxChecked());
            notifyItemChanged(getItemPosition(item));
            if (BoschListAdapter.this.mBoschListItemClickListener != null) {
                BoschListAdapter.this.mBoschListItemClickListener.onCheckedChanged(item, item.isCheckboxChecked());
            }
        } else if (type == BoschListItem.TYPE_SWITCH) {
            item.setSwitchChecked(!item.isSwitchChecked());
            notifyItemChanged(getItemPosition(item));
            if (BoschListAdapter.this.mBoschListItemClickListener != null) {
                BoschListAdapter.this.mBoschListItemClickListener.onCheckedChanged(item, item.isSwitchChecked());
            }
        } else {
            if (item.getAccordionItems() != null && item.getAccordionItems().size() > 0) {
                if (item.isAccordionExpanded()) {
                    item.setAccordionExpanded(false);
                    hideAccordion(getItemPosition(item), item.getAccordionItems());
                    holder.mIconRight.animate().rotation(0).start();
                } else {
                    item.setAccordionExpanded(true);
                    showAccordion(getItemPosition(item), item.getAccordionItems());
                    holder.mIconRight.animate().rotation(180).start();
                }
            } else if (BoschListAdapter.this.mBoschListItemClickListener != null) {
                BoschListAdapter.this.mBoschListItemClickListener.onListItemClicked(item);
            }
        }
    }

    /**
     * initializes the core view,
     * adds text and subtitle
     * when {@link BoschListItem#getTitle()} and {@link BoschListItem#getSubTitle()} are available make the views size bigger
     *
     * @param item
     * @param holder
     */
    private void initView(final BoschListItem item, final ViewHolder holder) {
        //Title
        final String title = item.getTitle();
        if (!TextUtils.isEmpty(title)) {
            holder.mTitle.setVisibility(View.VISIBLE);
            holder.mTitle.setText(title);
            holder.mTitle.setEnabled(item.isEnabled());
        } else if (item.getTitleRes() != -1) {
            holder.mTitle.setText(item.getTitleRes());
            holder.mTitle.setVisibility(View.VISIBLE);
            holder.mTitle.setEnabled(item.isEnabled());
        } else {
            holder.mTitle.setVisibility(View.INVISIBLE);
        }

        //Subtitle
        final String subTitle = item.getSubTitle();
        if (!item.isSubItem()) {
            if (!TextUtils.isEmpty(subTitle)) {
                holder.mSubTitle.setVisibility(View.VISIBLE);
                holder.mSubTitle.setText(subTitle);
                holder.mSubTitle.setEnabled(item.isEnabled());
            } else if (item.getSubTitleRes() != -1) {
                holder.mSubTitle.setText(item.getSubTitleRes());
                holder.mSubTitle.setVisibility(View.VISIBLE);
                holder.mSubTitle.setEnabled(item.isEnabled());
            } else {
                holder.mSubTitle.setVisibility(View.GONE);
            }
        }
        //height of item view
        if (TextUtils.isEmpty(title) || TextUtils.isEmpty(subTitle)) {
            holder.mView.setLayoutParams(new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, this.mGu6));
        } else {
            holder.mView.setLayoutParams(new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, this.mGu8));
        }
    }

    /**
     * adds the icon ({@link BoschListItem#getIconLeft()}) on the left side of the view
     *
     * @param item
     * @param holder
     */
    private void setIconLeft(final BoschListItem item, final ViewHolder holder) {
        //Image left
        final int imageLeft = item.getIconLeft();
        if (imageLeft != -1) {
            holder.mIconLeft.setVisibility(View.VISIBLE);
            holder.mIconLeft.setImageResource(imageLeft);
            holder.mIconLeft.setEnabled(item.isEnabled());
        } else {
            holder.mIconLeft.setVisibility(View.GONE);
        }
    }

    /**
     * adds {@link BoschListItem#getStatus()} or {@link BoschListItem#getSection()} to the view,
     * when both variables are defined the icon is added to the view!
     * <p>
     * adds {@link android.view.View.OnTouchListener} to the status layout to receive callbacks onClick
     * (needed {@link android.view.View.OnTouchListener}, otherwise icon / text wont be highlighted when item is pressed)
     *
     * @param item
     * @param holder
     */
    private void initStatus(final BoschListItem item, final ViewHolder holder) {
        final int statusIcon = item.getStatusIcon();
        final String status = item.getStatus();
        if (statusIcon == -1 && TextUtils.isEmpty(status)) {
            holder.mStatusLayout.setVisibility(View.GONE);
        } else {
            holder.mStatusLayout.setVisibility(View.VISIBLE);
            holder.mStatusLayout.setOnTouchListener(new View.OnTouchListener() {
                @Override
                public boolean onTouch(final View v, final MotionEvent event) {
                    if (!v.isEnabled() || !item.isEnabled()) {
                        return false;
                    }

                    switch (event.getAction()) {
                        case MotionEvent.ACTION_DOWN:
                            v.setPressed(true);
                            break;
                        case MotionEvent.ACTION_UP:
                            if (BoschListAdapter.this.mBoschListItemClickListener != null) {
                                BoschListAdapter.this.mBoschListItemClickListener.onStatusClicked(item, holder.mStatusLayout);
                            }
                            v.setPressed(false);
                            break;

                        case MotionEvent.ACTION_CANCEL:
                            v.setPressed(false);
                            break;

                        default:
                            break;
                    }
                    return true;
                }
            });
            if (statusIcon != -1) {
                holder.mStatusIcon.setImageResource(statusIcon);
                holder.mStatusIcon.setVisibility(View.VISIBLE);
                holder.mStatusIcon.setEnabled(item.isEnabled());
                holder.mStatus.setVisibility(View.GONE);
            } else {
                holder.mStatus.setText(status);
                holder.mStatusIcon.setVisibility(View.GONE);
                holder.mStatus.setVisibility(View.VISIBLE);
                holder.mStatus.setEnabled(item.isEnabled());
            }
        }
    }

    /**
     * initializes the view for {@link BoschListItem#TYPE_DEFAULT}
     * sets the right icon ({@link BoschListItem#getIconRight()}) and adds {@link android.view.View.OnTouchListener} to get callbacks
     * when icon is clicked
     * (needed {@link android.view.View.OnTouchListener}, otherwise icon / text wont be highlighted when item is pressed)
     *
     * @param item
     * @param holder
     */
    private void initDefault(final BoschListItem item, final ViewHolder holder) {
        holder.mCheckbox.setVisibility(View.GONE);
        holder.mSwitch.setVisibility(View.GONE);
        holder.mRadioButton.setVisibility(View.GONE);
        //Image right
        int imageRight = item.getIconRight();
        if (item.getAccordionItems() != null) {
            imageRight = R.drawable.bosch_ic_down;
        }
        if (imageRight != -1) {
            holder.mIconRight.setVisibility(View.VISIBLE);
            holder.mIconRight.setEnabled(item.isEnabled());
            holder.mIconRight.setImageResource(imageRight);
            if (imageRight != R.drawable.bosch_ic_down) {
                holder.mIconRight.setOnTouchListener(new View.OnTouchListener() {
                    @Override
                    public boolean onTouch(final View v, final MotionEvent event) {
                        if (!v.isEnabled() || !item.isEnabled()) {
                            return false;
                        }

                        switch (event.getAction()) {
                            case MotionEvent.ACTION_DOWN:
                                v.setPressed(true);
                                break;
                            case MotionEvent.ACTION_UP:
                                if (BoschListAdapter.this.mBoschListItemClickListener != null) {
                                    BoschListAdapter.this.mBoschListItemClickListener.onRightIconClicked(item, holder.mIconRight);
                                }
                                v.setPressed(false);
                                break;

                            case MotionEvent.ACTION_CANCEL:
                                v.setPressed(false);
                                break;

                            default:
                                break;
                        }
                        return true;
                    }
                });
            }
        } else {
            holder.mIconRight.setVisibility(View.GONE);
        }
    }

    /**
     * initializes the view for {@link BoschListItem#TYPE_RADIO_BUTTON}
     *
     * @param item
     * @param holder
     */
    private void initRadioButton(final BoschListItem item, final ViewHolder holder) {
        holder.mIconRight.setVisibility(View.GONE);
        holder.mSwitch.setVisibility(View.GONE);
        holder.mCheckbox.setVisibility(View.GONE);
        holder.mRadioButton.setVisibility(View.VISIBLE);
        holder.mRadioButton.setEnabled(item.isEnabled());
        //To prevent loop of always updating list item
        holder.mRadioButton.setOnCheckedChangeListener(null);
        if (!checkRadioButtonSection(item.getSection())) {
            holder.mRadioButton.setChecked(true);
            item.setRadioButtonChecked(true);
        } else {
            holder.mRadioButton.setChecked(item.isRadioButtonChecked());
        }
        holder.mRadioButton.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(final CompoundButton buttonView, final boolean isChecked) {
                checkRadioButton(item);
            }
        });
    }

    /**
     * Checks if one Radio Button in this Section is already checked
     *
     * @param section
     * @return
     */
    private boolean checkRadioButtonSection(final String section) {
        for (BoschListItem item : mItemList) {
            if (!TextUtils.isEmpty(section) && section.equals(item.getSection())) {
                if (item.isRadioButtonChecked()) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Handles selection of radio buttons in the same section,
     * if new radio button was selected uncheck every other button and check only this one
     *
     * @param checkedButton
     */
    private void checkRadioButton(final BoschListItem checkedButton) {
        if (this.mItemList != null) {
            int count = 0;
            int start = 0;
            int end = 0;
            for (BoschListItem item : this.mItemList) {
                if (!TextUtils.isEmpty(item.getSection())
                        && item.getSection().equals(checkedButton.getSection())) {
                    if (start == 0) {
                        start = count;
                    }
                    end = count;
                    item.setRadioButtonChecked(false);
                    if (BoschListAdapter.this.mBoschListItemClickListener != null && item != checkedButton) {
                        BoschListAdapter.this.mBoschListItemClickListener.onCheckedChanged(item, false);
                    }
                }
                count++;
            }
            checkedButton.setRadioButtonChecked(true);
            if (BoschListAdapter.this.mBoschListItemClickListener != null) {
                BoschListAdapter.this.mBoschListItemClickListener.onCheckedChanged(checkedButton, true);
            }
            notifyItemRangeChanged(start, end);
        }
    }

    /**
     * initializes the view for {@link BoschListItem#TYPE_SWITCH}
     *
     * @param item
     * @param holder
     */
    private void initSwitch(final BoschListItem item, final ViewHolder holder) {
        holder.mIconRight.setVisibility(View.GONE);
        holder.mCheckbox.setVisibility(View.GONE);
        holder.mRadioButton.setVisibility(View.GONE);
        holder.mSwitch.setVisibility(View.VISIBLE);
        holder.mSwitch.setEnabled(item.isEnabled());
        //To prevent loop of always updating list item
        holder.mSwitch.setOnCheckedChangeListener(null);
        holder.mSwitch.setChecked(item.isSwitchChecked());
        holder.mSwitch.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(final CompoundButton buttonView, final boolean isChecked) {
                item.setSwitchChecked(isChecked);
                if (BoschListAdapter.this.mBoschListItemClickListener != null) {
                    BoschListAdapter.this.mBoschListItemClickListener.onCheckedChanged(item, isChecked);
                }
            }
        });
    }

    /**
     * initializes the view for {@link BoschListItem#TYPE_CHECKBOX}
     *
     * @param item
     * @param holder
     */
    private void initCheckbox(final BoschListItem item, final ViewHolder holder) {
        holder.mIconRight.setVisibility(View.GONE);
        holder.mSwitch.setVisibility(View.GONE);
        holder.mRadioButton.setVisibility(View.GONE);
        holder.mCheckbox.setVisibility(View.VISIBLE);
        holder.mCheckbox.setEnabled(item.isEnabled());
        //To prevent loop of always updating list item
        holder.mCheckbox.setOnCheckedChangeListener(null);
        holder.mCheckbox.setChecked(item.isCheckboxChecked());
        holder.mCheckbox.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(final CompoundButton buttonView, final boolean isChecked) {
                item.setCheckboxChecked(isChecked);
                if (BoschListAdapter.this.mBoschListItemClickListener != null) {
                    BoschListAdapter.this.mBoschListItemClickListener.onCheckedChanged(item, isChecked);
                }
            }
        });
    }

    /**
     * shows accordion from item position and adds items to list
     *
     * @param position       the items position
     * @param accordionItems the sub-items which should be added to list
     */
    private void showAccordion(final int position, @NonNull final ArrayList<BoschListItem> accordionItems) {
        if (this.mItemList != null) {
            if (position >= 0 && position >= mItemList.size() - 1) {
                this.mItemList.addAll(accordionItems);
            } else {
                this.mItemList.addAll(position + 1, accordionItems);
            }
            notifyItemRangeInserted(position + 1, accordionItems.size());
        }
    }

    /**
     * hides accordion from item position and removes all items from list
     *
     * @param position       the items position
     * @param accordionItems the sub-items which should be removed from list
     */
    private void hideAccordion(final int position, @NonNull final ArrayList<BoschListItem> accordionItems) {
        if (this.mItemList != null) {
            this.mItemList.removeAll(accordionItems);
            notifyItemRangeRemoved(position + 1, accordionItems.size());
        }
    }

    /**
     * ViewHolder to display {@link BoschListItem}
     */
    public class ViewHolder extends RecyclerView.ViewHolder {

        public final View mView;
        public final BoschImageView mIconLeft;
        public final BoschImageView mIconRight;
        public final BoschLabel mTitle;
        public final BoschLabel mSubTitle;
        public final LinearLayout mStatusLayout;
        public final BoschLabel mStatus;
        public final BoschImageView mStatusIcon;
        public final BoschCheckBox mCheckbox;
        public final BoschSwitch mSwitch;
        public final BoschRadioButton mRadioButton;

        public ViewHolder(final View itemView) {
            super(itemView);
            this.mView = itemView;
            this.mTitle = itemView.findViewById(R.id.list_title);
            this.mSubTitle = itemView.findViewById(R.id.list_subtitle);
            this.mStatusLayout = itemView.findViewById(R.id.list_status_layout);
            this.mStatus = itemView.findViewById(R.id.list_status);
            this.mStatusIcon = itemView.findViewById(R.id.list_status_icon);
            this.mIconLeft = itemView.findViewById(R.id.list_icon_left);
            this.mIconRight = itemView.findViewById(R.id.list_icon_right);
            this.mCheckbox = itemView.findViewById(R.id.list_checkbox);
            this.mSwitch = itemView.findViewById(R.id.list_switch);
            this.mRadioButton = itemView.findViewById(R.id.list_radio_button);
        }
    }

    /**
     * ViewHolder to display sub-items of {@link BoschListItem}
     */
    private class ChildViewHolder extends ViewHolder {

        public final View mView;
        public final BoschLabel mTitle;

        public ChildViewHolder(final View itemView) {
            super(itemView);
            this.mView = itemView;
            this.mTitle = itemView.findViewById(R.id.list_title);
        }
    }

    /**
     * ViewHolder to display section headers
     */
    class HeaderHolder extends RecyclerView.ViewHolder {
        public BoschLabel header;

        public HeaderHolder(View itemView) {
            super(itemView);
            this.header = itemView.findViewById(R.id.section_header);
        }
    }

    /**
     * Abstract class which needs to be extended in your list item model
     * Holds Information like id, icon on the left side, title, icon on the right and section
     * Methods which must be overridden:
     * <p>
     * {@link #getId()}
     * <p>
     * Methods which can be overridden depending on your needs:
     * <p>
     * {@link #getTitle()}
     * <p>
     * {@link #getTitleRes()}
     * <p>
     * {@link #getSubTitleRes()}
     * <p>
     * {@link #getSubTitle()}
     * <p>
     * {@link #getSection()}
     * <p>
     * {@link #getIconLeft()}
     * <p>
     * {@link #getIconRight()}
     * <p>
     * {@link #getStatus()}
     * <p>
     * {@link #getStatusIcon()}
     * <p>
     * {@link #getAccordionItems()}
     * <p>
     * {@link #isSubItem()}
     * <p>
     * {@link #getType()}
     * <p>
     * Methods which don't need to be overridden and can be used just like this:
     * <p>
     * {@link #setEnabled(boolean)}
     * {@link #isEnabled()}
     * <p>
     * {@link #setCheckboxChecked(boolean)}
     * {@link #isCheckboxChecked()}
     * <p>
     * {@link #setSwitchChecked(boolean)}
     * {@link #isSwitchChecked()}
     * <p>
     * {@link #setRadioButtonChecked(boolean)}
     * {@link #isRadioButtonChecked()}
     * <p>
     * private methods for {@link BoschListAdapter}:
     * <p>
     * {@link #setAccordionExpanded(boolean)}
     * {@link #isAccordionExpanded()}
     */
    public static abstract class BoschListItem {

        public static final int TYPE_DEFAULT = 0;
        public static final int TYPE_RADIO_BUTTON = 1;
        public static final int TYPE_SWITCH = 2;
        public static final int TYPE_CHECKBOX = 3;

        private boolean mEnabled = true;
        private boolean mCheckboxChecked;
        private boolean mSwitchChecked;
        private boolean mRadioButtonChecked;
        private boolean mIsAccordionExpanded;

        /**
         * @return the item specific id
         */
        public abstract int getId();

        /**
         * @return null or empty string when no title should be displayed
         */
        public String getTitle() {
            return null;
        }

        /**
         * @return -1 when no title should be displayed
         */
        public int getTitleRes() {
            return -1;
        }

        /**
         * @return null or empty string when no subtitle should be displayed
         */
        public String getSubTitle() {
            return null;
        }

        /**
         * @return 0 when no title should be displayed
         */
        public int getSubTitleRes() {
            return -1;
        }

        /**
         * defines in which section the list item is placed,
         *
         * @return null or empty string when no sections are needed
         */
        public String getSection() {
            return null;
        }

        /**
         * @return -1 when no icon should be displayed
         */
        public int getIconLeft() {
            return -1;
        }

        /**
         * when right icon is set {@link OnBoschListItemClickedListener} is registered automatically on this view
         *
         * @return -1 when no icon should be displayed
         */
        public int getIconRight() {
            return -1;
        }

        /**
         * when status is set {@link OnBoschListItemClickedListener} is registered automatically on this view
         *
         * @return null or empty string when no status should be displayed
         */
        public String getStatus() {
            return null;
        }

        /**
         * when status icon is set {@link OnBoschListItemClickedListener} is registered automatically on this view
         *
         * @return -1 when no icon should be displayed,
         */
        public int getStatusIcon() {
            return -1;
        }

        /**
         * @return list of sub-items
         */
        public ArrayList<BoschListItem> getAccordionItems() {
            return null;
        }

        /**
         * @return true if item is sub-item
         */
        public boolean isSubItem() {
            return false;
        }

        /**
         * @return {@link #TYPE_DEFAULT}, {@link #TYPE_RADIO_BUTTON}, {@link #TYPE_SWITCH} or {@link #TYPE_CHECKBOX}
         */
        public int getType() {
            return this.TYPE_DEFAULT;
        }

        /**
         * @return true if list item should be enabled
         */
        public boolean isEnabled() {
            return this.mEnabled;
        }

        /**
         * sets status of list item
         *
         * @param enabled
         */
        public void setEnabled(final boolean enabled) {
            this.mEnabled = enabled;
        }

        /**
         * only necessary when {@link #TYPE_CHECKBOX} is active
         *
         * @return if {@link BoschCheckBox} is checked
         */
        public boolean isCheckboxChecked() {
            return this.mCheckboxChecked;
        }

        /**
         * only necessary when {@link #TYPE_CHECKBOX} is active
         * set state of {@link BoschCheckBox}
         *
         * @param checkboxChecked
         */
        public void setCheckboxChecked(final boolean checkboxChecked) {
            this.mCheckboxChecked = checkboxChecked;
        }

        /**
         * only necessary when {@link #TYPE_SWITCH} is active
         *
         * @return if {@link BoschSwitch} is checked
         */
        public boolean isSwitchChecked() {
            return this.mSwitchChecked;
        }

        /**
         * only necessary when {@link #TYPE_SWITCH} is active
         * set state of {@link BoschSwitch}
         *
         * @param switchChecked
         */
        public void setSwitchChecked(final boolean switchChecked) {
            this.mSwitchChecked = switchChecked;
        }

        /**
         * only necessary when {@link #TYPE_RADIO_BUTTON} is active
         *
         * @return if {@link BoschRadioButton} is checked
         */
        public boolean isRadioButtonChecked() {
            return this.mRadioButtonChecked;
        }

        /**
         * only necessary when {@link #TYPE_RADIO_BUTTON} is active
         * set state of {@link BoschRadioButton}
         *
         * @param radioButtonChecked
         */
        public void setRadioButtonChecked(final boolean radioButtonChecked) {
            this.mRadioButtonChecked = radioButtonChecked;
        }

        /**
         * @return state of items accordion
         */
        public boolean isAccordionExpanded() {
            return this.mIsAccordionExpanded;
        }

        /**
         * set state of items accordion
         *
         * @param accordionExpanded
         */
        public void setAccordionExpanded(final boolean accordionExpanded) {
            this.mIsAccordionExpanded = accordionExpanded;
        }
    }

    /**
     * Notifies when list item is clicked or right icon of list is clicked (e.g. to open {@link BoschMenu}
     */
    public interface OnBoschListItemClickedListener {
        /**
         * notify when list item is clicked
         *
         * @param item
         */
        void onListItemClicked(final BoschListItem item);

        /**
         * notify when right icon is clicked, e.g. to open {@link BoschMenu}
         *
         * @param item
         * @param iconView for setting the anchorView -> {@link BoschMenu#BoschMenu(Context, View)}
         */
        void onRightIconClicked(final BoschListItem item, final View iconView);

        /**
         * notify when status icon is clicked
         *
         * @param item
         * @param iconView for setting the anchorView -> {@link BoschPopover#BoschPopover(View, View)}
         *                 or like {@link #onRightIconClicked(BoschListItem, View)}
         */
        void onStatusClicked(final BoschListItem item, final View iconView);

        /**
         * notify when check changed for {@link BoschCheckBox}, {@link BoschSwitch}, {@link BoschRadioButton}
         * only if type == {@link BoschListItem#TYPE_CHECKBOX}, {@link BoschListItem#TYPE_SWITCH}, {@link BoschListItem#TYPE_RADIO_BUTTON}
         *
         * @param item
         * @param checked
         */
        void onCheckedChanged(final BoschListItem item, final boolean checked);
    }

}
