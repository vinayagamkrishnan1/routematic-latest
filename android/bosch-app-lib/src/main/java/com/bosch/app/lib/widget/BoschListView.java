package com.bosch.app.lib.widget;

import android.content.Context;
import android.graphics.drawable.Drawable;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.DividerItemDecoration;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.recyclerview.widget.SimpleItemAnimator;
import android.util.AttributeSet;

import com.bosch.app.lib.R;
import com.bosch.app.lib.adapter.BoschStickyHeaderAdapter;
import com.bosch.app.lib.adapter.BoschStickyHeaderDecoration;

/**
 * Created by M-Way Solutions in behalf of Bosch GmbH on 15.12.17.
 */

/**
 * Root layout for lists
 * sets the correct {@link RecyclerView.LayoutManager}, {@link DividerItemDecoration}
 * <p>
 * For section headers this has to be used with {@link com.bosch.app.lib.adapter.BoschListAdapter}
 * <p>
 * Definition:
 * A list is a container for minimum of two items represented in a single row each that is using the entire screen width.
 * The container for a list determines the entire screen but might be combined with buttons.
 * Each list item links to another page or offers a simple action related to the referring list item.
 * To add structure to a long list, sections can be used.
 * In case of list items that can be grouped, accordions provide an option to simplify the list visually.
 */
public class BoschListView extends RecyclerView {

    public BoschListView(Context context) {
        super(context);
        init(context);
    }

    public BoschListView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public BoschListView(Context context, @Nullable AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        init(context);
    }

    private void init(final Context context) {
        LinearLayoutManager layoutManager = new LinearLayoutManager(context);
        layoutManager.setOrientation(LinearLayoutManager.VERTICAL);
        setLayoutManager(layoutManager);
        final BoschListViewDecoration decoration = new BoschListViewDecoration(context, DividerItemDecoration.VERTICAL);
        final Drawable dividerDrawable = ContextCompat.getDrawable(context, R.drawable.bosch_list_divider);
        decoration.setDrawable(dividerDrawable);
        addItemDecoration(decoration);
        setHasFixedSize(true);
        //disables item animation
        ItemAnimator animator = getItemAnimator();
        if (animator instanceof SimpleItemAnimator) {
            ((SimpleItemAnimator) animator).setSupportsChangeAnimations(false);
        }
    }

    @Override
    public void setAdapter(Adapter adapter) {
        super.setAdapter(adapter);
        if (adapter instanceof BoschStickyHeaderAdapter && ((BoschStickyHeaderAdapter) adapter).hasHeaders()) {
            addItemDecoration(new BoschStickyHeaderDecoration((BoschStickyHeaderAdapter) adapter));
        }
    }

}
