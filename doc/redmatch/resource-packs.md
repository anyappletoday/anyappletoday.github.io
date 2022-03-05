# Redmatch 2 Resource Pack Documentation

![demo](images/demo.png)

## What's a resource pack?

A resource pack is a collection of files which replace things already in the game. In Redmatch 2, resource packs can replace textures and sounds.

## Where can I get resource packs?

You can get resource packs on the [Steam Workshop](https://steamcommunity.com/app/1280770/workshop/). Click the green plus button or the green subscribe on anything you like to automatically download it (it could take a bit to download so be patient).

## How do I make a resource pack?

You can make your own resource pack by creating a folder and filling it with various files.

![files](images/files.png)

Any files in your resource pack folder will replace the ones with the corresponding name in-game. For example, logo.png replaces the Redmatch 2 logo in-game.

The texture files (end in .png or .jpg) you can replace are:

	background
	bullet_hole
	kill_points_icon
	level_blue
	level_blue_cracked
	level_glass
	level_gray
	level_gray_cracked
	level_green
	level_light
	level_red
	level_white
	level_white_cracked
	level_yellow
	logo
	relax_poster
	rope
	skybox_back
	skybox_down
	skybox_front
	skybox_left
	skybox_right
	skybox_up
	square_select
	terrain
	thumb
	ui
	win_or_die_poster
	work_is_family_poster
	your_job_poster
    health_background
    health_foreground
    hitmarker
    unsuccessful_hitmarker
    loading
	telescopic
	red_dot
	rifle
	shotgun
	sniper

The audio files (end in .ogg or .wav) you can replace are:

	bullet_flyby
	cabinet_buy
	cabinet_change_option
	cabinet_not_enough
	cabinet_startup
	explosion
	footstep
	hurt
	kill
	mag_in
	mag_out
	menu_music
	reload
	rifle_prime
	rifle_shot
	shotgun_prime
	shotgun_shot
	sniper_shot
	ui_exp_tick
	ui_hover
	ui_level_up
	unsuccessful_hit
	melee_hit
	melee_miss

You can also use a folder of audio files with the same name, and the game will choose a random audio file to play out of the folder (ui sounds do not support this).

JSON files can optionally be used to customize various aspects of the files you provide.

These are the optional JSON parameters:

### General Textures (level_glass.json, level_green.json, etc)

filterMode can be Point, Bilinear, or Trilinear

	{
		"filterMode": "Point",
		"metallic": 0,
		"smoothness": 0,
		"tiling": { "x": 1, "y": 1 }
	}

### ui.json

filterMode can be Point, Bilinear, or Trilinear

	{
		"filterMode": "Point",
		"border": [2, 3, 2, 2],
		"borderWidth": 3
	}

### background_scroll.json

	{
		"height": 200,
		"time": 2,
		"ease": "Linear",
		"loopType": "Restart"
	}
	
### background_scroll_horizontal.json

	{
		"width": 0,
		"time": 2,
		"ease": "Linear",
		"loopType": "Restart"
	}

To test your resource pack before releasing it on the workshop, put all your files in a folder named ResourcePack (not ResourcePacks) in `%appdata%\..\LocalLow\Redlabs\Redmatch 2`

Press F5 at any time to reload all files in the resource pack (except for level textures)

When you've finished replacing all the files you want, you can upload your folder using the Upload button in-game on the Resource Pack menu. Uploading a pack with the same name as one you've previously uploaded will update the existing pack instead of uploading a new one.

# This documentation is still under construction! Join the [Discord Server](https://rugbug.net/discord) for help.