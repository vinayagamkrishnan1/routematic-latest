package com.bosch.app.lib.adapter;

import android.content.Context;
import androidx.recyclerview.widget.RecyclerView;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;

import com.bosch.app.lib.R;
import com.bosch.app.lib.widget.BoschGalleryView;
import com.bosch.app.lib.widget.BoschImageView;
import com.bosch.app.lib.widget.BoschLabel;

import java.util.List;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 15.12.17.
 */

/**
 * Adapter for {@link BoschGalleryView}
 * Needs {@link BoschGalleryItem}
 * Click Callbacks can be received with {@link OnBoschGalleryItemClickListener}
 * <p>
 * Methods to Override:
 * {@link #loadImage(BoschImageView, int, String)}
 */
public class BoschGalleryAdapter extends RecyclerView.Adapter<BoschGalleryAdapter.ViewHolder> {

    private final List<BoschGalleryItem> mValues;
    private final OnBoschGalleryItemClickListener mListener;
    private int mTileSize = BoschGalleryView.TILE_SIZE_SMALL;
    private final LayoutInflater mLayoutInfater;

    public BoschGalleryAdapter(final Context context,
                               final List<BoschGalleryItem> items) {
        this(context, items, null);
    }

    public BoschGalleryAdapter(final Context context,
                               final List<BoschGalleryItem> items,
                               final OnBoschGalleryItemClickListener listener) {
        mValues = items;
        mLayoutInfater = LayoutInflater.from(context);
        mListener = listener;
    }

    /**
     * gets the tilesize from {@link BoschGalleryView}
     *
     * @param recyclerView
     */
    @Override
    public void onAttachedToRecyclerView(final RecyclerView recyclerView) {
        super.onAttachedToRecyclerView(recyclerView);
        if (recyclerView instanceof BoschGalleryView) {
            this.mTileSize = ((BoschGalleryView) recyclerView).getTileSize();
        }
    }

    @Override
    public BoschGalleryAdapter.ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        if (mLayoutInfater != null) {
            View view;
            if (mTileSize == BoschGalleryView.TILE_SIZE_LARGE) {
                view = mLayoutInfater.inflate(R.layout.bosch_gallery_item_large, parent, false);
            } else {
                view = mLayoutInfater.inflate(R.layout.bosch_gallery_item_small, parent, false);
            }
            return new BoschGalleryAdapter.ViewHolder(view);
        }
        return null;
    }

    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        final BoschGalleryItem item = mValues.get(position);
        if (item != null) {
            final String title = item.getTitle();
            final String subtitle = item.getSubTitle();
            if (TextUtils.isEmpty(title)) {
                holder.mTitleLayout.setVisibility(View.GONE);
            } else {
                holder.mTitleLayout.setVisibility(View.VISIBLE);
                holder.mTitle.setText(title);
                if (TextUtils.isEmpty(subtitle)) {
                    holder.mSubTitle.setVisibility(View.GONE);
                } else {
                    holder.mSubTitle.setVisibility(View.VISIBLE);
                    holder.mSubTitle.setText(subtitle);
                }
            }
            prepareImageView(holder.mImage, LinearLayout.LayoutParams.MATCH_PARENT);
            loadImage(holder.mImage, item.getImageResource(), item.getImage());

            holder.mView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (mListener != null) {
                        mListener.onGalleryItemClick(item);
                    }
                }
            });
        }
    }

    /**
     * return the item at position
     * @param position
     * @return
     */
    public BoschGalleryItem getItem(final int position) {
        if (mValues != null && position < mValues.size()) {
            return mValues.get(position);
        }
        return null;
    }

    /**
     * return the position of item
     * @param item
     * @return
     */
    public int getItemPosition(BoschGalleryItem item) {
        return mValues != null ? mValues.indexOf(item) : -1;
    }

    /**
     * Override this method to load your images like you want to
     * When called it shows the placeholder image
     *
     * @param imageView  the image view where the image is displayed
     * @param resourceId the resource id if your image comes from resources
     * @param image      can be a url from where the image should be loaded
     */
    public void loadImage(final BoschImageView imageView, final int resourceId, final String image) {
        if (imageView.getContext() != null && imageView.getContext().getResources() != null) {
            prepareImageView(imageView, (int) imageView.getContext().getResources().getDimension(R.dimen.gu10));
        }
        imageView.setImageResource(R.drawable.bosch_ic_imagery);
    }

    /**
     * prepares the image view to display either the placeholder image or a loaded image
     *
     * @param imageView
     * @param size
     */
    private void prepareImageView(BoschImageView imageView, int size) {
        if (imageView != null) {
            final ViewGroup.LayoutParams params = imageView.getLayoutParams();
            if (params != null) {
                params.width = size;
                params.height = size;
                imageView.requestLayout();
            }
        }
    }

    @Override
    public int getItemCount() {
        return mValues != null ? mValues.size() : -1;
    }

    class ViewHolder extends RecyclerView.ViewHolder {

        final View mView;
        final BoschImageView mImage;
        final LinearLayout mTitleLayout;
        final BoschLabel mTitle;
        final BoschLabel mSubTitle;

        ViewHolder(View view) {
            super(view);
            this.mView = view;
            this.mImage = view.findViewById(R.id.gallery_image);
            this.mTitleLayout = view.findViewById(R.id.gallery_title_layout);
            this.mTitle = view.findViewById(R.id.gallery_title);
            this.mSubTitle = view.findViewById(R.id.gallery_subtitle);
        }
    }

    /**
     * Interface which needs to be implemented in your gallery item model
     * Holds informations like image, title and subtitle
     * <p>
     * getImageResource() should return -1 when no image is available, displays default placeholder image instead
     * <p>
     * getTitle() can be null or empty when no title should be displayed, complete title layout is hidden when title is null or empty
     * <p>
     * getSubtitle() can be null or empty when no subtitle should be displayed
     */
    public interface BoschGalleryItem {
        int getImageResource();

        String getImage();

        String getTitle();

        String getSubTitle();
    }

    /**
     * Notifies when gallery item is clicked
     */
    public interface OnBoschGalleryItemClickListener {
        void onGalleryItemClick(final BoschGalleryItem item);
    }

}
