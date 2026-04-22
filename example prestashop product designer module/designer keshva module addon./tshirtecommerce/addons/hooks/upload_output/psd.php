<?php
if (extension_loaded('imagick'))
{
	$data		    = $params['data'];
	$old 		    = $data['src'];
    $file_name      = $data['item']['file_name'];
    $temp           = explode('.', $file_name);
    $array          = explode($file_name, $old);

    $new_file       = $array[0].$temp[0].'.png';

    $path_old       = ROOT .DS. str_replace('/', DS, $old);
    $path_new       = ROOT .DS. str_replace('/', DS, $new_file);

    thumbGenerator($path_old, $path_new);

    $file_name                  = $temp[0].'.png';
    $data['src']                = $new_file;
    $data['printing']           = $old;
    $data['item']['file_name']  = $file_name;
    $data['item']['title']      = $file_name;
    $data['item']['thumb']      = $new_file;
    $data['item']['url']        = $new_file;
    $GLOBALS['data']            = $data;
}

function thumbGenerator($file, $new_file)
{
    $image              = new Imagick($file);
    $dimensions 		= $image->getImageGeometry();
    $width 			    = $dimensions['width'];
    $height 		    = $dimensions['height'];
    $maxWidth 		    = 720;
    $maxHeight 		   = 720;
    if($height > $width)
    {
        if($height > $maxHeight)
            $image->thumbnailImage(0, $maxHeight);
            $dimensions = $image->getImageGeometry();
            if($dimensions['width'] > $maxWidth){
                $image->thumbnailImage($maxWidth, 0);
            }
    }
    elseif($height < $width)
    {
        //Landscape
        $image->thumbnailImage($maxWidth, 0);
    }
    else
    {
        //square
        $image->thumbnailImage($maxWidth, 0);
    }

    $image->setResolution( 300, 300 );
    $image->setImageFormat( "png" );
   $image->writeImage($new_file);
}
?>