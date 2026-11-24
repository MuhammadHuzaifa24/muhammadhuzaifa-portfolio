(function () {
    var folder = File($.fileName).parent;
    var output = File(folder.fsName + "/portfolio-showreel.aep");
    if (output.exists || (app.project && app.project.numItems)) return;
    var project = app.project || app.newProject();
    function footage(path) {
        return project.importFile(new ImportOptions(File(path)));
    }
    var master = footage(folder.parent.parent.fsName + "/public/media/videos/promo.mp4");
    var comp = project.items.addComp("Creative Worlds - final edit",1920,1080,1,48,30);
    var cuts = [0,6,12,17,23,30,37,41,44,48];
    for (var i=0;i<cuts.length-1;i++) {
        var shot = comp.layers.add(master);
        shot.name = "Shot " + (i+1);
        shot.inPoint = cuts[i]; shot.outPoint = cuts[i+1];
        shot.audioEnabled = false;
    }
    var music = comp.layers.add(footage(folder.fsName + "/mix.wav"));
    music.name = "Final soundtrack"; music.outPoint = 48;
    project.save(output);
})();
