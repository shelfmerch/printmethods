<?php
$dgClass 		= new dg();
$settings 		= $dgClass->getSetting();
?>
<!-- add gallery -->
<div id="add-simple-gallery" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" style="display: none;">
	<div class="modal-dialog modal-lg">
		<div class="gallery-content" id="simple-preview-content">
			<div class="panel panel-simple">
				<div class="gallery-box-head panel-heading">
					<div class="gallery-title">Simple Gallery</div>

					<div class="box-layer-thumb tooltips" data-placement="left" data-original-title="Change thumb of gallery">
						<img src="<?php echo site_url('assets/images/photo.png', false); ?>" class="gallery-thumb" alt="Add thumb of gallery">
						<a href="javascript:void(0);" class="gallery-thumb-btn" onclick="jQuery.fancybox( {href : '<?php echo site_url('index.php/media/modals/gallery.thumb/1'); ?>', type: 'iframe'} );"><i class="fa fa-cog"></i></a>
					</div>

					<div class="box-layer-title">
						<input type="text" class="form-control slider-title" value="Gallery title">
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

						<div class="tooolbar-btn" style="display: none;">
							<div class="tabbable">
								<ul class="nav nav-tabs tab-bricky">
									<li class="active">
	                                                    <a href="#gallery-btn-general" data-toggle="tab" aria-expanded="false">General</a>
	                                                </li>
	                                                <li>
	                                                    <a href="#gallery-btn-button" data-toggle="tab" aria-expanded="false">Button</a>
	                                                </li>
	                                                <li>
	                                                    <a href="#gallery-btn-icon" data-toggle="tab" aria-expanded="false">Icon</a>
	                                                </li>
								</ul>

								<div class="tab-content">
									<!-- Begin tab General -->
									<div class="tab-pane active" id="gallery-btn-general">
										<div class="form-group group-product-design">
											<label>Choose product design</label>
											<select class="form-control gallery-btn-option list-products-design" data-type="product_id"></select>
										</div>

										<hr />

										<h4>Add info of popup</h4>
										<p class="help-block">This info will show when mouse hover on button.</p>
		
										<div class="form-group">
											<label>Title</label>
											<input type="text" value="Your button" data-default="Your button" class="form-control gallery-btn-option" data-type="popup_title" autocomplete="off">
										</div>

										<div class="form-group">
											<label>Image</label> <br />
											<div class="img-thumbnail">
												<img src="" width="50" class="popup_img" alt="No image">
												<input type="hidden" class="gallery-btn-option popup_img_value" data-type="img">
											</div>
											<a href="javascript:void(0);" class="btn btn-sm btn-default" onclick="jQuery.fancybox( {href : '<?php echo site_url('index.php/media/modals/gallery.layers.btn.image/1'); ?>', type: 'iframe'} );"><i class="fa fa-plus"></i></a>
										</div>

										<div class="form-group">
											<label>Description</label>
											<textarea class="form-control gallery-btn-option" data-type="popup_des"></textarea>
										</div>
									</div>
									<!-- End tab General -->

									<!-- Start tab button -->
									<div class="tab-pane" id="gallery-btn-button">
										<div class="form-group">
											<label>Display button</label><br />
											<div class="btn-group" data-toggle="buttons">
												<label class="btn btn-sm btn-primary active">
													<input type="radio" name="btn-action-show" class="gallery-btn-option gallery-btn-hide" data-type="show" value="0" autocomplete="off" checked> No
												</label>
												<label class="btn btn-sm btn-primary">
													<input type="radio" name="btn-action-show" class="gallery-btn-option gallery-btn-show" data-type="show" value="1" autocomplete="off"> Yes
												</label>
											</div>
										</div>

										<div class="form-group">
											<div class="row">
												<div class="col-sm-6">
													<label>Size</label>
													<select class="form-control gallery-btn-option" data-type="btn_size">
														<option value="default">Normal</option>
														<option value="small">Small</option>
														<option value="xs">Extra small</option>
														<option value="lg">Large</option>
													</select>
												</div>
												<div class="col-sm-6">
													<label>Style</label>
													<select class="form-control gallery-btn-option" data-type="btn_style">
														<option value="default">Basic Button</option>
														<option value="rounded">Rounded Button</option>
													</select>
												</div>
											</div>
										</div>


										<div class="form-group">
											<label>Button text</label>
											<input type="text" value="" class="form-control gallery-btn-option" data-type="text" autocomplete="off">
										</div>
										
										<hr />

										<div class="form-group">
											<label class="control-label"><strong>Background color</strong></label>
											<div class="row">
												<div class="col-sm-6">
													<label>Default</label>
													<div class="input-group">
														<input type="text" value="FFFFFF" class="color form-control gallery-btn-option" data-type="btn_color">
														<span class="input-group-btn">
															<button class="btn btn-default" onclick="gallery.layers.btn.removeColor(this)" type="button"><i class="text-danger fa fa-times"></i></button>
														</span>
													</div>
												</div>
												<div class="col-sm-6">
													<label>Mouse hover</label>
													<div class="input-group">
														<input type="text" value="FFFFFF" class="color form-control gallery-btn-option" data-type="btn_hover_color">
														<span class="input-group-btn">
															<button class="btn btn-default" onclick="gallery.layers.btn.removeColor(this)" type="button"><i class="text-danger fa fa-times"></i></button>
														</span>
													</div>
												</div>
											</div>
										</div>

										<div class="form-group">
											<label class="control-label"><strong>Text color</strong></label>
											<div class="row">
												<div class="col-sm-6">
													<label>Default</label>
													<input type="text" data-default="333333" value="333333" class="color form-control gallery-btn-option" data-type="text_color">
												</div>
												<div class="col-sm-6">
													<label>Mouse hover</label>
													<input type="text" data-default="333333" value="333333" class="color form-control gallery-btn-option" data-type="text_hover_color">
												</div>
											</div>
										</div>

										<div class="form-group">
											<label class="control-label"><strong>Border</strong></label>
											<div class="row">
												<div class="col-sm-4">
													<label>Size (px)</label>
													<input type="number" value="0" data-default="0" class="form-control gallery-btn-option" data-type="border_size">
												</div>
												<div class="col-sm-4">
													<label>Style</label>
													<select class="form-control gallery-btn-option" data-type="border_style">
														<option value="none">- Style -</option>
														<option value="hidden">hidden</option>
														<option value="dotted">dotted</option>
														<option value="dashed">dashed</option>
														<option value="solid">solid</option>
														<option value="double">double</option>
														<option value="groove">groove</option>
														<option value="ridge">ridge</option>
														<option value="inset">inset</option>
														<option value="outset">outset</option>
														<option value="initial">initial</option>
														<option value="inherit">inherit</option>
													</select>
												</div>
												<div class="col-sm-4">
													<label>Color</label>
													<input type="text" value="CCCCCC" data-default="CCCCCC" class="color form-control gallery-btn-option" data-type="border_color">
												</div>
											</div>
										</div>
									</div>

									<!-- Start tab icon -->
									<div class="tab-pane" id="gallery-btn-icon">
										<div class="form-group group-icon">
											<label class="control-label"><strong>Icon of button</strong></label>
											<div class="row">
												<div class="col-sm-12">
													<label>Select icon</label>
													<div class="input-group">
														<span class="input-group-addon"><i class="glyph-icon dgflaticon-location"></i></span>
														<input type="text" onclick="gallery.layers.btn.icon()" data-default="" value="glyph-icon dgflaticon-location" class="form-control gallery-btn-icon gallery-btn-option" data-type="icon">
														<span class="input-group-btn">
															<button class="btn btn-default" type="button"><i class="text-danger fa fa-times" aria-hidden="true"></i></button>
														</span>
													</div>
												</div>
											</div>
											<div class="row list-btn-icon" style="display: none;">
												<div class="box-icon"><i class="glyph-icon dgflaticon-interface"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-circle"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-location"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-like-1"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-link"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-back"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-next"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-shopping-cart-1"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-gift"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-shopping-cart"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-medical"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-interface-1"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-stop"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-symbol-3"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-signs-2"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-signs-1"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-arrows"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-symbol-2"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-attachment"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-symbol-1"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-signs"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-symbol"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-cross"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-error"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-add"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-info"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-placeholder-2"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-placeholder-1"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-plus"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-star-1"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-play-button"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-star"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-success"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-like"></i></div>
												<div class="box-icon"><i class="glyph-icon dgflaticon-placeholder"></i></div>
											</div>
										</div>
										
										<div class="form-group">
											<div class="row">
												<div class="col-sm-6">
													<label>Size (px)</label>
													<select class="form-control gallery-btn-option" data-type="icon_size">
														<?php for($iii = 10; $iii<=40; $iii++) { ?>
														<option value="<?php echo $iii; ?>px"><?php echo $iii; ?>px</option>
														<?php } ?>
													</select>
												</div>
												<div class="col-sm-6">
													<label>Position</label>
													<select class="form-control gallery-btn-option" data-type="position">
														<option value="left">Left</option>
														<option value="right">Right</option>
													</select>
												</div>
											</div>
										</div>
										
										<div class="form-group">
											<div class="row">
												<div class="col-sm-6">
													<label>Color</label>
													<input type="text" data-default="333333" value="333333" class="color form-control gallery-btn-option" data-type="icon_color">
												</div>

												<div class="col-sm-6">
													<label>Hover color</label>
													<input type="text" data-default="333333" value="333333" class="color form-control gallery-btn-option" data-type="icon_hover_color">
												</div>
											</div>
										</div>
																			<input type="hidden" class="gallery-btn-option btn-option-left" data-type="btn_left" value="0">
										<input type="hidden" class="gallery-btn-option btn-option-top" data-type="btn_top" value="0">
									</div>
								</div>

								<div class="tab-footer">
									<button type="button" class="btn btn-primary" onclick="gallery.layers.btn.save();"><i class="fa fa-check"></i> Save</button>
									<button type="button" class="btn btn-default" onclick="gallery.layers.btn.hide();"><i class="fa fa-times-circle"></i> Cancel</button>
								</div>
							</div>
						</div>
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
								
								<!-- Begin action button -->
								<button type="button" class="btn btn-xs btn-dark-grey tool-group tool-img tooltips" onclick="gallery.layers.btn.add();" data-original-title="Add button action"><i class="fa fa-link" aria-hidden="true"></i></button>
								<!-- End action button -->

								<button type="button" class="btn btn-xs btn-dark-grey tool-group tool-img tooltips area-set-bg" onclick="gallery.layers.tools.background(this);" data-original-title="Add background color of image with color of product color"><i class="fa fa-square-o" aria-hidden="true"></i> Add background color</button>

								<!-- Begin crop -->
								<button type="button" class="btn btn-xs btn-dark-grey tool-group tool-area tooltips" onclick="gallery.layers.tools.crop();" data-original-title="Crop area design"><i class="fa fa-crop" aria-hidden="true"></i></button>
								<!-- End Crop -->

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

<!-- import gallery -->
<div id="import-gallery" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" style="display: none;">
	<div class="modal-dialog modal-lg">
		<div class="modal-content">
			<div class="panel panel-simple">
				<div class="gallery-box-head panel-heading">
					<div class="gallery-title">Import Gallery</div>
					<div class="box-layer-title">
						<button type="button" onclick="jQuery('#upload-gallery').toggle();" class="btn btn-default">Upload file</button>
					</div>
					<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
				</div>

				<div class="panel-body" id="upload-gallery">
					<p>Please open file gallery in .json format, copy content and paste here.</p>
					<div class="form-group">
						<textarea class="form-control" id="gallery-import-data" rows="3"></textarea>
					</div>
					<div class="form-group">
						<button type="button" onclick="gallery.import.upload();" class="btn btn-default">Import Now</button>
					</div>
				</div>

				<div class="panel-body" id="store-gallery">
					<nav class="navbar navbar-default">
						<div class="container-fluid">
							<div class="navbar-header">
								<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#gallery-navbar-collapse" aria-expanded="false">
									<span class="sr-only">Toggle navigation</span>
									<span class="icon-bar"></span>
									<span class="icon-bar"></span>
									<span class="icon-bar"></span>
								</button>
								<a class="navbar-brand" href="#" style="padding: 15px 15px 0 0;">Templates Library</a>
							</div>

							<div class="collapse navbar-collapse" id="gallery-navbar-collapse">
								<ul class="nav navbar-nav nav-gallery-type">
									<li class="active" onclick="gallery.import.type(this, '');"><a href="#">All</a></li>
									<li onclick="gallery.import.type(this, 'simple');"><a href="#">Simple</a></li>
									<li onclick="gallery.import.type(this, '3d');"><a href="#">View 3D</a></li>
								</ul>
								<div class="navbar-form navbar-right">
									<div class="form-group">
										<input type="text" class="form-control search-gallery" onchange="gallery.import.search()" placeholder="Search gallery">
									</div>
								</div>
								<ul class="nav navbar-nav navbar-right">
									<li><a onclick="gallery.import.nav(this)" href="#">Clothing</a></li>
									<li><a onclick="gallery.import.nav(this)" href="#">Phone Cases</a></li>
									<li><a onclick="gallery.import.nav(this)" href="#">Mugs</a></li>
									<li>
										<div class="dropdown" style="padding: 16px 12px 0 12px;">
											<a href="#" class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">More... <span class="caret"></span></a>
											<ul class="dropdown-menu">
												<li><a onclick="gallery.import.nav(this)" href="#">T-Shirt</a></li>
												<li><a onclick="gallery.import.nav(this)" href="#">Hoodies</a></li>
												<li><a onclick="gallery.import.nav(this)" href="#">Bags</a></li>
												<li><a onclick="gallery.import.nav(this)" href="#">Hats</a></li>
												<li><a onclick="gallery.import.nav(this)" href="#">Cards</a></li>
												<li><a onclick="gallery.import.nav(this)" href="#">Canvas</a></li>
											</ul>
										</div>
									</li>
								</ul>
							</div>
						</div>
					</nav>
					
					<?php
					$is_store 		= false;
					$api_key 		= '';
					if(isset($settings->store))
					{
						$store 		= $settings->store;
						if(isset($store->api) && $store->api != '' && isset($store->verified) && isset($store->enable) && $store->enable == 1 && $store->verified == 1)
						{
							$is_store = true;
							$api_key = $store->api;
						}
					}
					?>
					<?php if($is_store === false) { ?>
					<br />
					<div class="alert alert-danger" role="alert">
						<p>Your API store is deactive. <a href="<?php echo site_url('index.php/settings'); ?>"><strong>Active now!</strong></a></p>
					</div>
					<?php } ?>
					<br />
					<div class="gallery-templates" data-api="<?php echo $api_key; ?>"></div>
				</div>
			</div>
		</div>
	</div>
</div>

<div id="help-gallery" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" style="display: none;">
	<div class="modal-dialog modal-lg" style="width:90%;">
		<div class="modal-content">
			<button type="button" class="close-help" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
			<img src="<?php echo site_url('assets/images/help-gallery.png'); ?>" class="img-responsive" alt="help">
		</div>
	</div>
</div>
<div id="help-gallery-detail" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" style="display: none;">
	<div class="modal-dialog modal-lg" style="width:90%;">
		<div class="modal-content">
			<button type="button" class="close-help" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
			<img src="<?php echo site_url('assets/images/help-gallery-tool.png'); ?>" class="img-responsive" alt="help">
		</div>
	</div>
</div>