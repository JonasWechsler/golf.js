class SettingsComponent implements Component{
    type:ComponentType = ComponentType.Settings;
    constructor(public cell_width:number,
                public cell_height:number,
                public render_scale:number,
                public DISCRETE_SCREENS:boolean){}
}
