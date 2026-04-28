<?php
	$settings = $GLOBALS['settings'];
	$addons   = $GLOBALS['addons']; 
	$paths    = ROOT .DS. 'addons' .DS. 'images' .DS. 'pattern' .DS. 'affTxt'.DS;
	$filesPat = $this->getFiles($paths, '.json');
	$patList  = array();
	if ($filesPat != false)
	{
		foreach($filesPat as $file)
		{
			$file_path = $paths .DS. $file;
			if (file_exists($file_path))
			{
				$content = file_get_contents($file_path);
				$array 	= json_decode($content, true);
				$patList[] = $array;
			}
		}
	}
	function sorter($key) {
		return function ($a, $b) use ($key) {
			return strnatcmp($a[$key], $b[$key]);
		};
	}
	usort($patList, sorter('order'));
?>
<div class="modal fade" id="affectionTextFilterModal" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
	<div class="modal-dialog modal-lg">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
				<h4 class="modal-title">
					<i class="fa fa-filter"></i>				
					<span><?php echo $addons->__('addon_textpattern_title_en'); ?></span>
				</h4>
			</div>
			<div class="modal-body">
				<div class="row">
					<input class="patternLabel" type="text" value="<?php echo $addons->__('addon_textpattern_buttonlabel_en'); ?>" style="display: none"></input>
					<div class="col-md-12 text-filter-area">
						<?php
							foreach($patList as $patt)
							{
								echo '<a class="filter-box" href="javaScript:void(0)" onclick="getTextFilter(this)">';
								echo '<svg viewBox="0 0 94 33" width="160" height="60" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="none">';
								echo '<g>';
								echo '<text stroke="none" stroke-width="0" stroke-linecap="round" stroke-linejoin="round" text-anchor="middle" x="27" y="24" font-size="24px" font-family="Alfa Slab One" fill="url(#'. $patt["id"]. ')"><tspan dy="0" x="50%">Pattern</tspan></text>';
								echo '<defs>';
								echo $patt["pattern"];
								echo '</defs>';
								echo '</g>';
								echo '</svg>';
								echo $patt["desc"];
								echo '</a>';
							}
						?>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>