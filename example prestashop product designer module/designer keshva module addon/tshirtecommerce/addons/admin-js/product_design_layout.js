/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: November 22 2015
 *
 * API
 *
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */
 
 var displayMode = 'block';
 if(design.mobile != undefined)
 {
	displayMode = 'table-cell';
 }

jQuery(document).on("product.change.design", function(event, product){
    // if using private layout of product
    if(typeof product != 'undefined' && typeof product.product_layout_design_allow_setting != 'undefined')
    {
        // Show Product Info
        if(product.product_layout_design.show_product_info == 0)
        {
            var el = jQuery("#dg-designer .col-left").find("a[data-target='#modal-product-info']");
            if(el.length == 1) el.css('display', 'none');
        }
        else
        {
            var el = jQuery("#dg-designer .col-left").find("a[data-target='#modal-product-info']");
            if(el.length == 1) el.css('display', 'block');
        }

        // Show Product Size Info
        if(product.product_layout_design.show_product_size == 0)
        {
            var el = jQuery("#dg-designer .col-left").find("a[data-target='#modal-product-size']");
            if(el.length == 1) el.css('display', 'none');
        }
        else
        {
            var el = jQuery("#dg-designer .col-left").find("a[data-target='#modal-product-size']");
            if(el.length == 1) el.css('display', 'block');
        }

        // Show Change Product
        if(product.product_layout_design.show_change_product == 0)
        {
            jQuery("ul.menu-left").find("a.view_change_products").parent().css('display','none');
        }
        else
        {
            jQuery("ul.menu-left").find("a.view_change_products").parent().css('display', displayMode);
        }

        // Allow Add Text
        if(product.product_layout_design.show_add_text == 0)
        {
            jQuery("ul.menu-left").find("a.add_item_text").parent().css('display','none');
        }
        else
        {
            jQuery("ul.menu-left").find("a.add_item_text").parent().css('display', displayMode);
        }

        // Allow Add Art
        if(product.product_layout_design.show_add_art == 0)
        {
            jQuery("ul.menu-left").find("a.add_item_clipart").parent().css('display','none');
        }
        else
        {
            jQuery("ul.menu-left").find("a.add_item_clipart").parent().css('display', displayMode);
        }

        // Allow Upload. find text:'Upload image'
        if(product.product_layout_design.show_upload == 0)
        {
            var el = jQuery("#dg-designer ul.menu-left").find("a[data-target='#dg-myclipart']");
            if(el.length == 1) el.css('display', 'none');
        }
        else
        {
            var el = jQuery("#dg-designer ul.menu-left").find("a[data-target='#dg-myclipart']");
            if(el.length == 1) el.css('display', displayMode);
        }

        // Allow Add Team
        if(product.product_layout_design.show_add_team == 0)
        {
            jQuery("ul.menu-left").find("a.add_item_team").parent().css('display','none');
        }
        else
        {
            jQuery("ul.menu-left").find("a.add_item_team").parent().css('display', displayMode);
        }

        // Allow Add QRcode
        if(product.product_layout_design.show_add_qrcode == 0)
        {
            jQuery("ul.menu-left").find("a.add_item_qrcode").parent().css('display','none');
        }
        else
        {
            jQuery("ul.menu-left").find("a.add_item_qrcode").parent().css('display', displayMode);
        }

        // Show Color used
        if(product.product_layout_design.show_color_used == 0)
        {
            jQuery("#ui-accordion-2-header-1").css('display', 'none'); // ui-accordion-2-header-1
        }
        else
        {
            jQuery("#ui-accordion-2-header-1").css('display', 'block'); // ui-accordion-2-header-1
        }

        // Show Screen size
        if(product.product_layout_design.show_screen_size == 0)
        {
            jQuery("#ui-accordion-2-header-2").css('display', 'none'); // ui-accordion-2-header-2
        }
        else
        {
            jQuery("#ui-accordion-2-header-2").css('display', 'block'); // ui-accordion-2-header-2
        }
    }
    else
    {
        if(typeof setting_all_product_design_layout != 'undefined')
        {
            // Show Product Info
            if(setting_all_product_design_layout.show_product_info == 0)
            {
                var el = jQuery("#dg-designer .col-left").find("a[data-target='#modal-product-info']");
                if(el.length == 1) el.css('display', 'none');
            }
            else
            {
                var el = jQuery("#dg-designer .col-left").find("a[data-target='#modal-product-info']");
                if(el.length == 1) el.css('display', 'block');
            }

            // Show Product Size Info
            if(setting_all_product_design_layout.show_product_size == 0)
            {
                var el = jQuery("#dg-designer .col-left").find("a[data-target='#modal-product-size']");
                if(el.length == 1) el.css('display', 'none');
            }
            else
            {
                var el = jQuery("#dg-designer .col-left").find("a[data-target='#modal-product-size']");
                if(el.length == 1) el.css('display', 'block');
            }

            // Show Change Product
            if(setting_all_product_design_layout.show_product == 0)
            {
                jQuery("ul.menu-left").find("a.view_change_products").parent().css('display','none');
            }
            else
            {
                jQuery("ul.menu-left").find("a.view_change_products").parent().css('display', displayMode);
            }

            // Allow Add Text
            if(setting_all_product_design_layout.show_add_text == 0)
            {
                jQuery("ul.menu-left").find("a.add_item_text").parent().css('display','none');
            }
            else
            {
                jQuery("ul.menu-left").find("a.add_item_text").parent().css('display', displayMode);
            }

            // Allow Add Art
            if(setting_all_product_design_layout.show_add_art == 0)
            {
                jQuery("ul.menu-left").find("a.add_item_clipart").parent().css('display','none');
            }
            else
            {
                jQuery("ul.menu-left").find("a.add_item_clipart").parent().css('display', displayMode);
            }

            // Allow Upload. find text:'Upload image'
            if(setting_all_product_design_layout.show_add_upload == 0)
            {
                var el = jQuery("#dg-designer ul.menu-left").find("a[data-target='#dg-myclipart']");
                if(el.length == 1) el.css('display', 'none');
            }
            else
            {
                var el = jQuery("#dg-designer ul.menu-left").find("a[data-target='#dg-myclipart']");
                if(el.length == 1) el.css('display', displayMode);
            }

            // Allow Add Team
            if(setting_all_product_design_layout.show_add_team == 0)
            {
                jQuery("ul.menu-left").find("a.add_item_team").parent().css('display','none');
            }
            else
            {
                jQuery("ul.menu-left").find("a.add_item_team").parent().css('display', displayMode);
            }

            // Allow Add QRcode
            if(setting_all_product_design_layout.show_add_qrcode == 0)
            {
                jQuery("ul.menu-left").find("a.add_item_qrcode").parent().css('display','none');
            }
            else
            {
                jQuery("ul.menu-left").find("a.add_item_qrcode").parent().css('display', displayMode);
            }

            // Show Color used
            if(setting_all_product_design_layout.show_color_used == 0)
            {
                jQuery("#ui-accordion-2-header-1").css('display', 'none'); // ui-accordion-2-header-1
            }
            else
            {
                jQuery("#ui-accordion-2-header-1").css('display', 'block'); // ui-accordion-2-header-1
            }

            // Show Screen size
            if(setting_all_product_design_layout.show_screen_size == 0)
            {
                jQuery("#ui-accordion-2-header-2").css('display', 'none'); // ui-accordion-2-header-2
            }
            else
            {
                jQuery("#ui-accordion-2-header-2").css('display', 'block'); // ui-accordion-2-header-2
            }
        }
    }
});

jQuery(document).on('ini.design', function(event) {
	if(typeof setting_all_product_design_layout != 'undefined')
	{
		// Show Product Info
		if(setting_all_product_design_layout.show_product_info == 0)
		{
			var el = jQuery("#dg-designer .col-left").find("a[data-target='#modal-product-info']");
			if(el.length == 1) el.css('display', 'none');
		}
		else
		{
			var el = jQuery("#dg-designer .col-left").find("a[data-target='#modal-product-info']");
			if(el.length == 1) el.css('display', 'block');
		}

		// Show Product Size Info
		if(setting_all_product_design_layout.show_product_size == 0)
		{
			var el = jQuery("#dg-designer .col-left").find("a[data-target='#modal-product-size']");
			if(el.length == 1) el.css('display', 'none');
		}
		else
		{
			var el = jQuery("#dg-designer .col-left").find("a[data-target='#modal-product-size']");
			if(el.length == 1) el.css('display', 'block');
		}

		// Show Change Product
		if(setting_all_product_design_layout.show_product == 0)
		{
			jQuery("ul.menu-left").find("a.view_change_products").parent().css('display','none');
		}
		else
		{
			jQuery("ul.menu-left").find("a.view_change_products").parent().css('display', displayMode);
		}

		// Allow Add Text
		if(setting_all_product_design_layout.show_add_text == 0)
		{
			jQuery("ul.menu-left").find("a.add_item_text").parent().css('display','none');
		}
		else
		{
			jQuery("ul.menu-left").find("a.add_item_text").parent().css('display', displayMode);
		}

		// Allow Add Art
		if(setting_all_product_design_layout.show_add_art == 0)
		{
			jQuery("ul.menu-left").find("a.add_item_clipart").parent().css('display','none');
		}
		else
		{
			jQuery("ul.menu-left").find("a.add_item_clipart").parent().css('display', displayMode);
		}

		// Allow Upload. find text:'Upload image'
		if(setting_all_product_design_layout.show_add_upload == 0)
		{
			var el = jQuery("#dg-designer ul.menu-left").find("a[data-target='#dg-myclipart']");
			if(el.length == 1) el.css('display', 'none');
		}
		else
		{
			var el = jQuery("#dg-designer ul.menu-left").find("a[data-target='#dg-myclipart']");
			if(el.length == 1) el.css('display', displayMode);
		}

		// Allow Add Team
		if(setting_all_product_design_layout.show_add_team == 0)
		{
			jQuery("ul.menu-left").find("a.add_item_team").parent().css('display','none');
		}
		else
		{
			jQuery("ul.menu-left").find("a.add_item_team").parent().css('display', displayMode);
		}

		// Allow Add QRcode
		if(setting_all_product_design_layout.show_add_qrcode == 0)
		{
			jQuery("ul.menu-left").find("a.add_item_qrcode").parent().css('display','none');
		}
		else
		{
			jQuery("ul.menu-left").find("a.add_item_qrcode").parent().css('display', displayMode);
		}

		// Show Color used
		if(setting_all_product_design_layout.show_color_used == 0)
		{
			jQuery("#ui-accordion-2-header-1").css('display', 'none'); // ui-accordion-2-header-1
		}
		else
		{
			jQuery("#ui-accordion-2-header-1").css('display', 'block'); // ui-accordion-2-header-1
		}

		// Show Screen size
		if(setting_all_product_design_layout.show_screen_size == 0)
		{
			jQuery("#ui-accordion-2-header-2").css('display', 'none'); // ui-accordion-2-header-2
		}
		else
		{
			jQuery("#ui-accordion-2-header-2").css('display', 'block'); // ui-accordion-2-header-2
		}
	}
});
