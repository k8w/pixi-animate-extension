module.exports = {
    pluginTempDebug: 'project/win/pixi-animate-vs2017/x64/Debug/pixi-animate-vs2017.dll',
    pluginTempRelease: 'project/win/pixi-animate-vs2017/x64/Release/pixi-animate-vs2017.dll',
    pluginFile: 'com.jibo.PixiAnimate/plugin/lib/win/PixiAnimate.fcm',
    installFolder: 'C:\\Program Files (x86)\\Common Files\\Adobe\\CEP\\extensions\\com.jibo.PixiAnimate',
    
    // ZXP plugin packaging options
    packager: '.\\build\\bin\\ZXPSignCmd.exe',

    // VS2017 Solution file for building the win32 plugin
    projectFile: '.\\project\\win\\pixi-animate-vs2017\\pixi-animate-vs2017.sln',
    
    // This path only works for Visual Studio 2017 (VS14), 
    // so this must be updated accordingly with VS studio switch
    VCTargetsPath: "C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\BuildTools\\Common7\\IDE\\VC\\VCTargets",

    // Command to uncompress to local install folder
    installCmd: '.\\build\\bin\\7za.exe x -y -bb0 -o"${installFolder}" "${output}"',

    // List of gulp task to run when creating plugins
    pluginTasks: ['plugin-win-debug', 'plugin-win']
};