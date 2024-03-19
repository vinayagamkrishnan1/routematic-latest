/*
 * Copyright 2014 Eduardo Barrenechea
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.bosch.app.lib.adapter;

import android.graphics.Canvas;
import android.graphics.Rect;
import androidx.recyclerview.widget.RecyclerView;
import android.util.LongSparseArray;
import android.view.View;
import android.view.ViewGroup;

import com.bosch.app.lib.widget.BoschListView;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 15.12.17.
 */

/**
 * A sticky header decoration (section headers) for {@link BoschListView}.
 */
public class BoschStickyHeaderDecoration extends RecyclerView.ItemDecoration {

    private LongSparseArray<RecyclerView.ViewHolder> mHeaderCache;

    private BoschStickyHeaderAdapter mAdapter;

    private boolean mRenderInline;

    /**
     * @param adapter the sticky header adapter to use
     */
    public BoschStickyHeaderDecoration(BoschStickyHeaderAdapter adapter) {
        this(adapter, false);
    }

    /**
     * @param adapter the sticky header adapter to use
     */
    public BoschStickyHeaderDecoration(BoschStickyHeaderAdapter adapter, boolean renderInline) {
        mAdapter = adapter;
        mHeaderCache = new LongSparseArray<>();
        mRenderInline = renderInline;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void getItemOffsets(Rect outRect, View view, RecyclerView parent, RecyclerView.State state) {
        int position = parent.getChildAdapterPosition(view);

        int headerHeight = 0;
        if (position != RecyclerView.NO_POSITION && hasHeader(position)) {
            RecyclerView.ViewHolder headerViewHolder = getHeader(parent, position);
            if (headerViewHolder != null) {
                View header = headerViewHolder.itemView;
                headerHeight = getHeaderHeightForLayout(header);
            }
        }
        outRect.set(0, headerHeight, 0, 0);
    }

    /**
     * Clears the header view cache. Headers will be recreated and
     * rebound on list scroll after this method has been called.
     */
    public void clearHeaderCache() {
        mHeaderCache.clear();
    }

    public View findHeaderViewUnder(float x, float y) {
        for (int i = 0; i < mHeaderCache.size(); i++) {
            final View child = mHeaderCache.valueAt(i).itemView;
            final float translationX = child.getTranslationX();
            final float translationY = child.getTranslationY();

            if (x >= child.getLeft() + translationX &&
                    x <= child.getRight() + translationX &&
                    y >= child.getTop() + translationY &&
                    y <= child.getBottom() + translationY) {
                return child;
            }
        }

        return null;
    }

    private boolean hasHeader(int position) {
        if (!mAdapter.hasHeaders()) {
            return false;
        }
        if (position == 0) {
            return true;
        }

        int previous = position - 1;
        return mAdapter.getHeaderId(position) != mAdapter.getHeaderId(previous);
    }

    private RecyclerView.ViewHolder getHeader(RecyclerView parent, int position) {
        final long key = mAdapter.getHeaderId(position);
        if (key == -1) {
            return null;
        }

        final RecyclerView.ViewHolder holder;
        if (mHeaderCache.get(key) != null) {
            holder = mHeaderCache.get(key);
        } else {
            holder = mAdapter.onCreateHeaderViewHolder(parent);
            //noinspection unchecked
            mAdapter.onBindHeaderViewHolder(holder, position);

            mHeaderCache.put(key, holder);
        }
        if (holder != null && holder.itemView != null) {
            final View header = holder.itemView;
            int widthSpec = View.MeasureSpec.makeMeasureSpec(parent.getWidth(), View.MeasureSpec.EXACTLY);
            int heightSpec = View.MeasureSpec.makeMeasureSpec(parent.getHeight(), View.MeasureSpec.UNSPECIFIED);
            int childWidth = ViewGroup.getChildMeasureSpec(widthSpec,
                    parent.getPaddingLeft() + parent.getPaddingRight(), header.getLayoutParams().width);
            int childHeight = ViewGroup.getChildMeasureSpec(heightSpec,
                    parent.getPaddingTop() + parent.getPaddingBottom(), header.getLayoutParams().height);

            header.measure(childWidth, childHeight);
            header.layout(0, 0, header.getMeasuredWidth(), header.getMeasuredHeight());
        }
        return holder;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void onDrawOver(Canvas c, RecyclerView parent, RecyclerView.State state) {
        if (!mAdapter.hasHeaders()) {
            return;
        }
        final int count = parent.getChildCount();

        for (int layoutPos = 0; layoutPos < count; layoutPos++) {
            final View child = parent.getChildAt(layoutPos);

            final int adapterPos = parent.getChildAdapterPosition(child);

            if (adapterPos != RecyclerView.NO_POSITION && (layoutPos == 0 || hasHeader(adapterPos))) {
                RecyclerView.ViewHolder headerViewHolder = getHeader(parent, adapterPos);
                if (headerViewHolder != null) {
                    View header = headerViewHolder.itemView;
                    c.save();
                    final int left = child.getLeft();
                    final int top = getHeaderTop(parent, child, header, adapterPos, layoutPos);
                    c.translate(left, top);
                    header.setTranslationX(left);
                    header.setTranslationY(top);
                    header.draw(c);
                    c.restore();
                }
            }
        }
    }

    private int getHeaderTop(RecyclerView parent, View child, View header, int adapterPos, int layoutPos) {
        int headerHeight = getHeaderHeightForLayout(header);
        int top = ((int) child.getY()) - headerHeight;
        if (layoutPos == 0) {
            final int count = parent.getChildCount();
            final long currentId = mAdapter.getHeaderId(adapterPos);
            // find next view with header and compute the offscreen push if needed
            for (int i = 1; i < count; i++) {
                int adapterPosHere = parent.getChildAdapterPosition(parent.getChildAt(i));
                if (adapterPosHere != RecyclerView.NO_POSITION) {
                    long nextId = mAdapter.getHeaderId(adapterPosHere);
                    if (nextId != currentId) {
                        RecyclerView.ViewHolder headerViewHolder = getHeader(parent, adapterPosHere);
                        final View next = parent.getChildAt(i);
                        final int offset = headerViewHolder != null ?
                                ((int) next.getY()) - (headerHeight + headerViewHolder.itemView.getHeight()) : -1;
                        if (offset < 0) {
                            return offset;
                        } else {
                            break;
                        }
                    }
                }
            }

            top = Math.max(0, top);
        }

        return top;
    }

    private int getHeaderHeightForLayout(View header) {
        return mRenderInline ? 0 : header.getHeight();
    }
}
