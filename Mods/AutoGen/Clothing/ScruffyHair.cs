namespace Eco.Mods.TechTree
{
    using System.Collections.Generic;
    using System.ComponentModel;
    using System.Linq;
    using Eco.Gameplay.Components;
    using Eco.Gameplay.DynamicValues;
    using Eco.Gameplay.Items;
    using Eco.Gameplay.Players;
    using Eco.Gameplay.Skills;
    using Eco.Mods.TechTree;
    using Eco.Shared.Items;
    using Eco.Shared.Localization;
    using Eco.Shared.Serialization;
    using Eco.Shared.Utils;
    using Eco.Shared.View;
    
    [Serialized]
    [Category("Hidden")]  
    [Weight(100)]      
    public partial class ScruffyHairItem :
        ClothingItem        
    {

        public override string FriendlyName     { get { return "Scruffy Hair"; } }
        public override string Description      { get { return "Rockstar cool-person hair. This finely crafted hairpiece says \"I don't care what you think. I'm wearing an awesome toupee\"."; } }
        public override string Slot             { get { return ClothingSlot.Hair; } }             
        public override bool Starter            { get { return true ; } }                       

    }

    
    [RequiresSkill(typeof(ClothesmakingSkill), 0)]
    public class ScruffyHairRecipe : Recipe
    {
        public ScruffyHairRecipe()
        {
            this.Products = new CraftingElement[]
            {
                new CraftingElement<ScruffyHairItem>(),
            };
            this.Ingredients = new CraftingElement[]
            {
                new CraftingElement<FurPeltItem>(typeof(ClothesmakingEfficiencySkill), 5, ClothesmakingEfficiencySkill.MultiplicativeStrategy)
            };
            this.CraftMinutes = new ConstantValue(10);
            this.Initialize("Scruffy Hair", typeof(ScruffyHairRecipe));
            CraftingComponent.AddRecipe(typeof(TailoringTableObject), this);
        }
    } 
}