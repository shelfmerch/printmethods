<?php 
/**
 * @author tshirtecommerce - www.tshirtecommerce.com
 * @date: 2017-06-7
 * 
 * @copyright  Copyright (C) 2015 tshirtecommerce.com. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE
 *
 */
 
	$settings = $GLOBALS['settings']; 
	$addons   = $GLOBALS['addons']; 
	$pth      = ROOT .DS. 'addons' .DS. 'images' .DS. 'shape' .DS;
	$filesIcn = $this->getFiles($pth, '.json');
	$svgList  = array();
	if ($filesIcn != false)
	{
		foreach($filesIcn as $file)
		{
			$file_path = $pth .DS. $file;
			if (file_exists($file_path))
			{
				$content = file_get_contents($file_path);
				$array 	= json_decode($content);
				$svgList[] = $array;
			}
		}
	}
?>
<div class="modal fade bs-example-modal-lg" id="svgFilterModal" tabindex="-1" role="dialog" aria-labelledby="shapeModalLabel">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
        <div class="modal-header">
			<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
			<label class="shapeRatio"><input type="checkbox" id="shapeRatioChk"></input>&nbsp;<?php echo $addons->__('addon_shapefilter_proportion_en'); ?></label>
			<h4 class="modal-title" id="myModalLabel">
				<i class="fa fa-heart"></i>
				<span><?php echo $addons->__('addon_shapefilter_title_en'); ?></span>
			</h4>
        </div>
		<div class="modal-body">
			<div id="svgShapeWraper">
				<div class="StupidIE">
					<input type="text" style="display: none" id="shapelabelbtn" value="<?php echo $addons->__('addon_shapefilter_label_en'); ?>"></input>
					<svg id="svgOrg" version="1.1" preserveAspectRatio="none" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
						<image  x="0" y="0" preserveAspectRatio="none" id="imageOrg" xlink:href="" />
					</svg>
					<div id="maskShapeOverlay"></div>
					<svg style="z-index: 10" id="svgFilter" version="1.1" preserveAspectRatio="none" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
						<defs>
							<clipPath id="clipTmp" data-boxwidth="24" data-boxheight="24">
								<path d="M12 4.248c-3.148-5.402-12-3.825-12 2.944 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.944z"/>
							</clipPath>
						</defs>   
						<image x="0" y="0" preserveAspectRatio="none" id="imageFilter" xlink:href="" style="clip-path: url(#clipTmp)" />
					</svg>
				</div>
				<div id="maskShapeMove"></div>
				<div class="select_crop_scroll"><img class="image_crop_scroll"/></div>
			</div>
		</div>
        <div class="modal-footer">
			<div id="svgIconList">
				<?php
					foreach($svgList as $svg)
					{
						echo '<svg class="shapCollection shapId'. $svg->id. '" data-shapid="'. $svg->id. '" xmlns="http://www.w3.org/2000/svg" width="100" height="62.5" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 '.$svg->boxwidth. ' '.$svg->boxheight. '">';
						echo $svg->path;
						echo '</svg>';
					}
				?>
			</div> 
			<div class="btn-group" role="group">
				<button type="button" class="btn btn-default" data-dismiss="modal" id="filterCloseAction">
					<?php echo $addons->__('addon_shapefilter_close_en'); ?>
				</button>
				<button type="button" class="btn btn-primary" id="svgFilterAction">
					<?php echo $addons->__('addon_shapefilter_save_en'); ?>
				</button>
			</div>	
        </div>
    </div>
  </div>
</div>