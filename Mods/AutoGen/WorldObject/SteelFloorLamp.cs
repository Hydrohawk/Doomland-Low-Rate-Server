namespace Eco.Mods.TechTree
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel;
    using Eco.Gameplay.Blocks;
    using Eco.Gameplay.Components;
    using Eco.Gameplay.Components.Auth;
    using Eco.Gameplay.DynamicValues;
    using Eco.Gameplay.Economy;
    using Eco.Gameplay.Housing;
    using Eco.Gameplay.Interactions;
    using Eco.Gameplay.Items;
    using Eco.Gameplay.Minimap;
    using Eco.Gameplay.Objects;
    using Eco.Gameplay.Players;
    using Eco.Gameplay.Property;
    using Eco.Gameplay.Skills;
    using Eco.Gameplay.Systems.TextLinks;
    using Eco.Gameplay.Pipes.LiquidComponents;
    using Eco.Gameplay.Pipes.Gases;
    using Eco.Gameplay.Systems.Tooltip;
    using Eco.Shared;
    using Eco.Shared.Math;
    using Eco.Shared.Localization;
    using Eco.Shared.Serialization;
    using Eco.Shared.Utils;
    using Eco.Shared.View;
    using Eco.Shared.Items;
    using Eco.Gameplay.Pipes;
    using Eco.World.Blocks;
    
    [Serialized]    
    [RequireComponent(typeof(OnOffComponent))]                   
    [RequireComponent(typeof(PropertyAuthComponent))]
    [RequireComponent(typeof(MinimapComponent))]                
    [RequireComponent(typeof(PowerGridComponent))]              
    [RequireComponent(typeof(PowerConsumptionComponent))]                     
    [RequireComponent(typeof(HousingComponent))]                  
    public partial class SteelFloorLampObject : 
        WorldObject,    
        IRepresentsItem
    {
        public override string FriendlyName { get { return "Steel Floor Lamp"; } } 

        public virtual Type RepresentedItemType { get { return typeof(SteelFloorLampItem); } } 


        protected override void Initialize()
        {
            this.GetComponent<MinimapComponent>().Initialize("Lights");                                 
            this.GetComponent<PowerConsumptionComponent>().Initialize(250);                      
            this.GetComponent<PowerGridComponent>().Initialize(10, new ElectricPower());        
            this.GetComponent<HousingComponent>().Set(SteelFloorLampItem.HousingVal);                                


        }

        public override void Destroy()
        {
            base.Destroy();
        }
       
    }

    [Serialized]
    public partial class SteelFloorLampItem :
        WorldObjectItem<SteelFloorLampObject> 
    {
        public override string FriendlyName { get { return "Steel Floor Lamp"; } } 
        public override string Description  { get { return  "A more modern way to light up a room. This time from the floor."; } }

        static SteelFloorLampItem()
        {
            
        }

        [TooltipChildren] public HousingValue HousingTooltip { get { return HousingVal; } }
        [TooltipChildren] public static HousingValue HousingVal { get { return new HousingValue() 
                                                {
                                                    Category = "General",
                                                    Val = 5,                                   
                                                    TypeForRoomLimit = "Lights", 
                                                    DiminishingReturnPercent = 0.8f    
        };}}
        
        [Tooltip(7)] private LocString PowerConsumptionTooltip { get { return new LocString(string.Format(Localizer.DoStr("Consumes: {0}w"), Text.Info(250))); } }  
    }


    [RequiresSkill(typeof(SteelworkingSkill), 2)]
    public partial class SteelFloorLampRecipe : Recipe
    {
        public SteelFloorLampRecipe()
        {
            this.Products = new CraftingElement[]
            {
                new CraftingElement<SteelFloorLampItem>(),
            };

            this.Ingredients = new CraftingElement[]
            {
                new CraftingElement<LightBulbItem>(1), 
                new CraftingElement<SteelItem>(typeof(SteelworkingEfficiencySkill), 10, SteelworkingEfficiencySkill.MultiplicativeStrategy),
                new CraftingElement<PlasticItem>(typeof(SteelworkingEfficiencySkill), 10, SteelworkingEfficiencySkill.MultiplicativeStrategy),   
            };
            SkillModifiedValue value = new SkillModifiedValue(10, SteelworkingSpeedSkill.MultiplicativeStrategy, typeof(SteelworkingSpeedSkill), Localizer.DoStr("craft time"));
            SkillModifiedValueManager.AddBenefitForObject(typeof(SteelFloorLampRecipe), Item.Get<SteelFloorLampItem>().UILink(), value);
            SkillModifiedValueManager.AddSkillBenefit(Item.Get<SteelFloorLampItem>().UILink(), value);
            this.CraftMinutes = value;
            this.Initialize("Steel Floor Lamp", typeof(SteelFloorLampRecipe));
            CraftingComponent.AddRecipe(typeof(RoboticAssemblyLineObject), this);
        }
    }
}