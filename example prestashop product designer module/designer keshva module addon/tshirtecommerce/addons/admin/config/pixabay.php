<?php
$pixabay_langs = array(
	'en' => 'English', 
	'cs' => 'Čeština', 
	'da' => 'Dansk', 
	'de' => 'Deutsch', 
	'es' => 'Español', 
	'fr' => 'Français', 
	'id' => 'Indonesia', 
	'it' => 'Italiano', 
	'hu' => 'Magyar', 
	'nl' => 'Nederlands', 
	'no' => 'Norsk', 
	'pl' => 'Polski', 
	'pt' => 'Português', 
	'ro' => 'Română', 
	'sk' => 'Slovenčina', 
	'fi' => 'Suomi', 
	'sv' => 'Svenska', 
	'tr' => 'Türkçe', 
	'vi' => 'Việt', 
	'th' => 'ไทย', 
	'bg' => 'Български', 
	'ru' => 'Русский', 
	'el' => 'Ελληνική', 
	'ja' => '日本語', 
	'ko' => '한국어', 
	'zh' => '简体中文' 
);
$pixabay_lang_active = setValue($data['settings'], 'pixabay_lang', 'en');
?>
<div class="panel panel-default">
	<div class="panel-heading">
		<i class="clip-phone"></i> Get Photo From Pixabay
		<div class="panel-tools">
			<a href="javascript:void(0);" class="btn btn-xs btn-link panel-collapse collapses"></a>
		</div>
	</div>
	<div class="panel-body">
		<div class="form-group row">
			<label class="col-sm-3 control-label">Show</label>
			<div class="col-sm-6">
				<?php echo displayRadio('show_pixabay', $data['settings'], 'show_pixabay', 1); ?>		
			</div>
		</div>
	
		<div class="form-group row">
			<label class="col-sm-3 control-label">Your language</label>
			<div class="col-sm-6">
				<select class="form-control" name="setting[pixabay_lang]">
				<?php foreach($pixabay_langs as $lang_key => $lang_name) { ?>

					<option value="<?php echo $lang_key; ?>" <?php if($pixabay_lang_active == $lang_key) echo 'selected="selected"'; ?>><?php echo $lang_name; ?></option>

				<?php } ?>
				</select>
			</div>
		</div>
	</div>
</div>