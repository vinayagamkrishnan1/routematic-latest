package com.nivaata.routematic.intune.intuneutils;

import androidx.core.content.FileProvider;

/**
 * This FileProvider allows the app to export files to other apps.
 *
 * Will automatically be blocked by MAM if necessary.
 */
public class CustomFileProvider extends FileProvider { }
