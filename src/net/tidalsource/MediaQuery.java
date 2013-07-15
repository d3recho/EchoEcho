package net.tidalsource;

import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Base64;
import android.util.Log;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.*;
import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.Context;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;

public class MediaQuery extends CordovaPlugin {

	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {		
		if (action.equals("listArtists")) {
			JSONArray json = this.listArtists();
			callbackContext.success(json);
		} 
		else if (action.equals("listAlbumsFromArtist")) {
			JSONArray json = null;
			try {
				json = this.listAlbumsFromArtist(args.getString(0));
			} catch (JSONException e) {
				callbackContext.error("Could not complete action listSongsFrom");
				//e.printStackTrace();
			}
			callbackContext.success(json);
		} 
		else if (action.equals("listSongsFromArtist")) {
			JSONArray json = null;
			try {
				json = this.listSongsFrom(args.getString(0), "artist");
			} catch (JSONException e) {
				callbackContext.error("Could not complete action listSongsFrom");
				//e.printStackTrace();
			}
			callbackContext.success(json);
		} 
		else if (action.equals("listSongsFromAlbum")) {
			JSONArray json = null;
			try {
				json = this.listSongsFrom(args.getString(0), "album");
			} catch (JSONException e) {
				callbackContext.error("Could not complete action listSongsFrom");
				//e.printStackTrace();
			}
			callbackContext.success(json);
		}
		return true;
	}
	
	public JSONArray listArtists() {
		String[] projection = {
		        MediaStore.Audio.Artists._ID,
		        MediaStore.Audio.Artists.ARTIST
		};

		Activity ctx = this.cordova.getActivity();
		Cursor cursor = ctx.managedQuery(
		        MediaStore.Audio.Artists.EXTERNAL_CONTENT_URI,
		        projection,
		        null,
		        null,
		        null);

		JSONArray songs = new JSONArray();
		List<String> artists = new ArrayList<String>();
		
		while(cursor.moveToNext()) { 
				try {
					songs.put(new JSONObject().put("id", cursor.getString(0)).put("name", cursor.getString(1)));
				} catch (JSONException e) {
					e.printStackTrace();
				}
		}
		return songs;
	}
	
	public JSONArray listAlbumsFromArtist(String artistId) {
		
		String selection = MediaStore.Audio.Media.IS_MUSIC + " != 0 AND " + MediaStore.Audio.Media.ARTIST_ID + " = "+artistId;

		String[] projection = {
				MediaStore.Audio.Media.ARTIST_ID,
				MediaStore.Audio.Media.ALBUM,
		        MediaStore.Audio.Media.ALBUM_ID
		        
		};

		Activity ctx = this.cordova.getActivity();
		Cursor cursor = ctx.managedQuery(
		        MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
		        projection,
		        selection,
		        null,
		        null);

		JSONArray songs = new JSONArray();
		List<String> albums = new ArrayList<String>();
		
		while(cursor.moveToNext()) {
			// TODO: See if we can not just sort list ARTISTS, instead of sorting each tune.
			if(!albums.contains(cursor.getString(2))){				
				albums.add(cursor.getString(2));
				String artwork = getAlbumArtwork(cursor.getLong(2));
				
				try {					
					songs.put(new JSONObject().put("id", cursor.getString(2)).put("name", cursor.getString(1)).put("art", artwork));
				} catch (JSONException e) {
					e.printStackTrace();
				}
			}
		}
		return songs;
	}
	
	private String getAlbumArtwork(Long album_id) {
		Uri sArtworkUri = Uri.parse("content://media/external/audio/albumart");
		Uri uri = ContentUris.withAppendedId(sArtworkUri, album_id);
		Activity ctx = this.cordova.getActivity();
		ContentResolver res = ctx.getContentResolver();
		InputStream in = null;
		try {
			in = res.openInputStream(uri);
		} catch (FileNotFoundException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
			return "";
		}
		Bitmap artwork = BitmapFactory.decodeStream(in);
		ByteArrayOutputStream stream = new ByteArrayOutputStream();
		artwork.compress(Bitmap.CompressFormat.JPEG, 100, stream);
		byte[] byteArray = stream.toByteArray();
		String base64Img = Base64.encodeToString(byteArray, Base64.DEFAULT);
		
		return base64Img;
	}
	
	public JSONArray listSongsFrom(String fromId, String from) {
		String selection = null;
		if(from == "artist") {
			selection = MediaStore.Audio.Media.IS_MUSIC + " != 0 AND " + MediaStore.Audio.Media.ARTIST_ID + " = "+fromId;
		} 
		else if(from == "album") {
			selection = MediaStore.Audio.Media.IS_MUSIC + " != 0 AND " + MediaStore.Audio.Media.ALBUM_ID + " = "+fromId;
		}

		String[] projection = {
				MediaStore.Audio.Media._ID,
		        MediaStore.Audio.Media.ARTIST_ID,
		        MediaStore.Audio.Media.ARTIST,
		        MediaStore.Audio.Media.ALBUM_ID,
		        MediaStore.Audio.Media.ALBUM,
		        MediaStore.Audio.Media.TITLE,
		        MediaStore.Audio.Media.DURATION,
		        MediaStore.Audio.Media.DATA
		};

		Activity ctx = this.cordova.getActivity();
		Cursor cursor = ctx.managedQuery(
		        MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
		        projection,
		        selection,
		        null,
		        null);

		JSONArray songs = new JSONArray();		
		while(cursor.moveToNext()) {
				try {
					songs.put(new JSONObject()
							.put("id", cursor.getString(0))
							.put("artist", cursor.getString(2))
							.put("album", cursor.getString(4))
							.put("title", cursor.getString(5))
							.put("duration", cursor.getString(6))
							.put("path", cursor.getString(7).replace("/mnt/sdcard", ""))
							
							);
				} catch (JSONException e) {
					e.printStackTrace();
				}
		}
		return songs;
	}	
}