package com.bosch.app.lib.widget;

import android.content.Context;
import android.content.res.Resources;
import android.content.res.TypedArray;
import android.graphics.Point;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import android.util.AttributeSet;
import android.view.Display;
import android.view.WindowManager;

import com.bosch.app.lib.R;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 15.12.17.
 */

/**
 * Needs to be used together with {@link com.bosch.app.lib.adapter.BoschGalleryAdapter}
 * <p>
 * Definition:
 * A gallery is a collection of images that are arranged in a grid on the screen.
 * Attached on each image is a label with one or two lines of text that give an idea of what the image is representing.
 * The images might link to another page, but doesn't necessarily have to.
 * Distances between images, as well as design and layout of labels, need to be implemented as defined.
 * <p>
 * Attributes:
 * {@link R.styleable#BoschGalleryView_tileSize}
 * - defines the size of the gallery images (large, small)
 */
public class BoschGalleryView extends RecyclerView {

    public static final int TILE_SIZE_SMALL = 0;
    public static final int TILE_SIZE_LARGE = 1;

    private int mTileSize = TILE_SIZE_SMALL;
    private float mMinSize;
    private GridLayoutManager mLayoutManager;

    public BoschGalleryView(Context context, int tileSize) {
        super(context);
        init(context, null);
    }

    public BoschGalleryView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    public BoschGalleryView(Context context, @Nullable AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        init(context, attrs);
    }

    /**
     * inits Gallery View, tile size depends on {@link R.styleable#BoschGalleryView_tileSize} default is {@link #TILE_SIZE_SMALL}
     *
     * @param context
     * @param attrs
     */
    private void init(final Context context, final AttributeSet attrs) {
        int spanCount = 2;
        if (attrs != null) {
            TypedArray a = context.getTheme().obtainStyledAttributes(
                    attrs,
                    R.styleable.BoschGalleryView,
                    0, 0);
            final int enumValue;
            try {
                this.mTileSize = a.getInteger(R.styleable.BoschGalleryView_tileSize, this.TILE_SIZE_SMALL);
            } finally {
                a.recycle();
            }
        }
        final Resources res = context.getResources();
        if (res != null) {
            final int padding = (int) res.getDimension(R.dimen.gu);
            setPadding(padding, padding, padding, padding);

            if (this.mTileSize == this.TILE_SIZE_SMALL) {
                this.mMinSize = res.getDimension(R.dimen.gu22) + padding * 2;
            } else {
                this.mMinSize = res.getDimension(R.dimen.gu32) + padding * 2;
            }
            spanCount = calculateSpanCount(context, this.mMinSize);
        }
        setHasFixedSize(true);
        this.mLayoutManager = new GridLayoutManager(context, spanCount);
        setLayoutManager(this.mLayoutManager);
        setClipToPadding(false);
    }

    /**
     * @return {@link #TILE_SIZE_SMALL} or {@link #TILE_SIZE_LARGE}
     */
    public int getTileSize() {
        return this.mTileSize;
    }

    /**
     * calculates how many tiles fit next to each other depending on {@link #mMinSize}
     *
     * @param context
     * @param minSize
     * @return
     */
    private int calculateSpanCount(final Context context, final float minSize) {
        if (context != null) {
            WindowManager wm = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
            Display display = wm.getDefaultDisplay();
            Point size = new Point();
            display.getRealSize(size);
            final int screenWidth = size.x;
            return (int) (screenWidth / minSize);
        }
        return 2;
    }

    /**
     * updates span count if layout changes e.g. after orientation
     */
    private void updateSpanCount() {
        final Context context = getContext();
        if (context != null && this.mMinSize > 0) {
            this.mLayoutManager.setSpanCount(calculateSpanCount(context, this.mMinSize));
        }
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        if (changed) {
            updateSpanCount();
        }
        super.onLayout(changed, l, t, r, b);
    }
}
