<!-- 3D gallery -->
<div id="add-3d-gallery" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" style="display: none;">
	<div class="modal-dialog modal-lg">
		<div class="gallery-content" id="3d-preview-content">
			<div class="panel panel-simple">
				<div class="gallery-box-head panel-heading">
					<div class="gallery-title">3D Gallery</div>

					<div class="box-layer-thumb tooltips" data-placement="left" data-original-title="Change thumb of gallery">
						<img src="<?php echo site_url('assets/images/photo.png', false); ?>" class="gallery-thumb" alt="Add thumb of gallery">
						<a href="javascript:void(0);" class="gallery-thumb-btn" onclick="jQuery.fancybox( {href : '<?php echo site_url('index.php/media/modals/gallery.thumb/1'); ?>', type: 'iframe'} );"><i class="fa fa-cog"></i></a>
					</div>

					<div class="box-layer-title">
						<input type="text" class="form-control slider-title" value="Gallery title">
					</div>

					<div class="gallery-slider-number">
						<span>Number of slider</span> <input type="number" onchange="gallery.slider.config.changeSlide(this);" class="form-control slider-number-value" value="12">

						<span>Time delay (sec)</span> <input type="number" class="form-control slider-time-delay" value="300">
						<button type="button" class="btn btn-sm btn-primary tooltips" onclick="gallery.slider.config.init()" data-placement="left" data-original-title="Edit detail with each slide"><i class="fa fa-cogs"></i></button>
					</div>

					<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				</div>

				<div class="panel-body">
					<div class="gallery-left">
						<div class="layer-navigation-toggler">
							<span class="pull-left"><strong>Layers</strong></span>
							<a href="javascript:void(0);" class="pull-right" onclick="gallery.nav(this)">
								<i class="clip-chevron-right"></i>
							</a>
							<a href="javascript:void(0);" class="pull-right" onclick="gallery.nav(this)">
								<i class="clip-chevron-left"></i>
							</a>
						</div>
						<div class="gallery-layers"></div>
					</div>

					<div class="gallery-right">
						<div class="gallery-tooolbar">
							<span class="tooolbar-option">
								<div class="input-group tooltips" data-original-title="Width of windown design">
									<input type="text" class="box-small gallery-size-width" onchange="gallery.design.setSize(this, 'width');" value="500"> <span class="input-group-right">px</span>
								</div>

								<span style="margin: 4px 4px;">X</span>

								<div class="input-group tooltips" data-original-title="Height of windown design">
									<input type="text" class="box-small gallery-size-height" onchange="gallery.design.setSize(this, 'height');" value="500"> <span class="input-group-right">px</span>
								</div>

								<span class="boder-line"></span>
								
								<button type="button" class="btn btn-xs tooltips" onclick="gallery.layers.tools.ruler();" data-original-title="Ruler">
									<i class="flaticon-ruler-1" aria-hidden="true"></i>
								</button>

								<span class="boder-line"></span>

								<button type="button" class="btn btn-xs tooltips" onclick="gallery.layers.tools.zoom();" data-original-title="Zoom in, Zoom out">
									<i class="fa fa-search-plus" aria-hidden="true"></i>
								</button>
								<span class="gallery-zoom">
									<div class="slider-padding-area"></div>
								</span>
							</span>

							<span class="tooolbar-option tooolbar-layers">
								<button type="button" class="btn btn-xs btn-dark-grey tool-group tool-img tool-area tooltips" onclick="gallery.layers.tools.fit();" data-original-title="Automatic fit area design"><i class="fa fa-compress" aria-hidden="true"></i></button>
								
								<!-- Begin crop -->
								<button type="button" class="btn btn-xs btn-dark-grey tool-group tool-area tooltips" onclick="gallery.layers.tools.crop();" data-original-title="Crop area design"><i class="fa fa-crop" aria-hidden="true"></i></button>
								<!-- End Crop -->
								
								<button type="button" class="btn btn-xs btn-dark-grey tool-group tool-img tooltips area-set-bg" onclick="gallery.layers.tools.background(this);" data-original-title="Add background color of image with color of product color"><i class="fa fa-square-o" aria-hidden="true"></i> Add background color</button>
								
								<button type="button" class="btn btn-xs btn-dark-grey tool-group tool-area tooltips area-set-bg" onclick="gallery.layers.tools.background(this);" data-original-title="Allow change background of area design with product color"><i class="fa fa-square-o" aria-hidden="true"></i> Add background color</button>

								<button type="button" class="btn btn-xs btn-dark-grey tool-group tool-area tooltips" onclick="gallery.design.warp.init('show');" data-original-title="Custom area design"><i class="flaticon-vector"></i></button>
								
								<button type="button" class="btn btn-xs btn-dark-grey tool-group tool-curve tooltips" onclick="gallery.design.curve('back');" data-original-title="Re-edit area design"><i class="flaticon-perspective"></i></button>
								<button type="button" class="btn btn-xs btn-dark-grey tool-group tool-curve tooltips" data-original-title="Change slider to custom curve of area design"><i class="flaticon-vector"></i> &nbsp; Curve area design</button>
								<button type="button" class="btn btn-xs btn-info tool-group tool-curve tooltips" onclick="gallery.design.curve('done');" data-original-title="Complete edit area"><i class="fa fa-check"></i></button>
								<button type="button" class="btn btn-xs btn-danger tool-group tool-curve tooltips" onclick="gallery.design.curve('cancel');" data-original-title="Cancel curve area"><i class="fa fa-ban"></i></button>
								
								<button type="button" class="btn btn-xs btn-dark-grey tool-group tool-warp tooltips" data-original-title="Move 4 points to custom area design"><i class="flaticon-perspective"></i> &nbsp; Custom area design</button>
								
								<button type="button" class="btn btn-xs btn-info tool-group tool-warp tooltips" onclick="gallery.design.warp.init('done');" data-original-title="Complete custom area design and next"><i class="fa fa-check"></i></button>

								<span class="boder-line tool-group tool-area tool-img"></span>

								<button type="button" class="btn btn-xs btn-dark-grey tool-group tool-warp tooltips" onclick="gallery.design.warp.init('skip');" data-original-title="Skip and continue curve area design"><i class="flaticon-vector"></i></button>
								
								<!-- Begin Move -->
								<button type="button" class="btn btn-xs btn-dark-grey tool-group tool-img tool-area tooltips" onclick="gallery.layers.tools.move('top');" data-original-title="Align top edges"><i class="flaticon-interface-2"></i></button>
								<button type="button" class="btn btn-xs btn-dark-grey tool-group tool-img tool-area tooltips" onclick="gallery.layers.tools.move('vertical');" data-original-title="Align vertical center"><i class="flaticon-center-alignment-1"></i></button>
								<button type="button" class="btn btn-xs btn-dark-grey tool-group tool-img tool-area tooltips" onclick="gallery.layers.tools.move('botton');" data-original-title="Align botton edges"><i class="flaticon-interface-1"></i></button>

								<button type="button" class="btn btn-xs btn-dark-grey tool-group tool-img tool-area tooltips" onclick="gallery.layers.tools.move('left');" data-original-title="Align left edges"><i class="flaticon-left-alignment"></i></button>
								<button type="button" class="btn btn-xs btn-dark-grey tool-group tool-img tool-area tooltips" onclick="gallery.layers.tools.move('horizontal');" data-original-title="align horizontal center"><i class="flaticon-center-alignment"></i></button>
								<button type="button" class="btn btn-xs btn-dark-grey tool-group tool-img tool-area tooltips" onclick="gallery.layers.tools.move('right');" data-original-title="Align right edges"><i class="flaticon-interface"></i></button>
								<!-- End Move -->
								
								<div class="btn-group btn-group-xs tooltips tool-action-grid tool-group tool-crop" data-original-title="Choose number of columns crop">
									<button type="button" class="btn btn-default" onclick="gallery.layers.tools.grid(1);">1</button>
									<button type="button" class="btn btn-default" onclick="gallery.layers.tools.grid(2);">2</button>
									<button type="button" class="btn btn-default" onclick="gallery.layers.tools.grid(3);">3</button>
									<button type="button" class="btn btn-default" onclick="gallery.layers.tools.grid(4);">4</button>
									<button type="button" class="btn btn-default" onclick="gallery.layers.tools.grid(5);">5</button>
									<button type="button" class="btn btn-default" onclick="gallery.layers.tools.grid(6);">6</button>
									<button type="button" class="btn btn-default" onclick="gallery.layers.tools.grid(0);">x</button>
								</div>

								<span class="boder-line tool-group tool-crop"></span>

								<button type="button" class="btn btn-xs btn-danger tool-group tool-crop tooltips" onclick="gallery.layers.tools.crop('cancel');" data-original-title="Cancel crop"><i class="fa fa-ban"></i></button>
								
								<button type="button" style="width: 36px;" class="btn btn-xs btn-dark-grey area-curve tool-group tool-curve tooltips" data-original-title="value curve area design">0</button>
								
								<span class="boder-line tool-group tool-area tool-img"></span>

								<button type="button" class="btn btn-xs btn-danger tool-group tool-warp tooltips" onclick="gallery.design.warp.init('cancel');" data-original-title="Cancel custom area design"><i class="fa fa-ban"></i></button>

								<button type="button" class="btn btn-xs btn-danger tool-group tool-custom tooltips" onclick="gallery.design.custom('cancel');" data-original-title="Cancel custom area design"><i class="fa fa-ban"></i></button>

								<button type="button" class="btn btn-xs btn-info tool-group tool-img tool-area tooltips" onclick="gallery.layers.unselect();" data-original-title="Done"><i class="fa fa-check"></i></button>

								<button type="button" class="btn btn-xs btn-info tool-group tool-crop tooltips" onclick="gallery.layers.tools.crop('crop');" data-original-title="Crop area"><i class="fa fa-check"></i></button>

								<div class="slider-curve tool-group tool-curve" style="display: none;">
									<div class="slider-curve-val ui-slider-handle"></div>
								</div>
							</span>

							<button type="button" class="btn pull-right btn-info btn-squared gallery-layers-save" onclick="gallery.layers.save();" style="height: 100%;"><i class="fa fa-floppy-o"></i> Save</button>
						</div>
						<div class="gallery-wapper">
							<div class="gallery-area"></div>
						</div>
					</div>
				</div>

				<div class="gallery-box-footer panel-footer">
					<a href="javascript:void(0);" class="btn btn-sm btn-default" onclick="jQuery.fancybox( {href : '<?php echo site_url('index.php/media/modals/gallery.layers.images/2'); ?>', type: 'iframe'} );"><i class="fa fa-plus-circle" aria-hidden="true"></i> Image</a>

					<div class="dropdown dropup">
						<button type="button" class="btn btn-sm btn-teal" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							<i class="fa fa-plus-circle"></i> Add Area Design
							<span class="caret"></span>
						</button>

						<ul class="dropdown-menu">
							<li>
								<a href="javascript:void(0);" onclick="gallery.layers.addArea('front');">Add <strong>Front</strong></a>
							</li>

							<li>
								<a href="javascript:void(0);" onclick="gallery.layers.addArea('back');">Add <strong>Back</strong></a>
							</li>

							<li>
								<a href="javascript:void(0);" onclick="gallery.layers.addArea('left');">Add <strong>Left</strong></a>
							</li>

							<li>
								<a href="javascript:void(0);" onclick="gallery.layers.addArea('right');">Add <strong>Right</strong></a>
							</li>
						</ul>
					</div>

					<div class="pull-right">
						<a href="#help-gallery" data-toggle="modal" data-target="#help-gallery-detail" class="btn btn-sm btn-default pull-left"><i class="fa fa-question" aria-hidden="true"></i> Help</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>