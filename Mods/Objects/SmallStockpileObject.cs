﻿// Copyright (c) Strange Loop Games. All rights reserved.
// See LICENSE file in the project root for full license information.

namespace Eco.Mods.TechTree
{
    using Eco.Gameplay.Components;
    using Eco.Gameplay.Objects;
    using Eco.Gameplay.Components.Auth;
    using Eco.Gameplay.Items;
    using Eco.Shared.Math;
    using Eco.Shared.Networking;
    using Eco.Shared.Serialization;
    using Eco.Gameplay.Players;

    public partial class SmallStockpileItem : WorldObjectItem<SmallStockpileObject>
    {
        public override bool TryPlaceObject(Player player, Vector3i position, Quaternion rotation)
        {
            return TryPlaceObjectOnSolidGround(player, position, rotation, SmallStockpileObject.DefaultDim);
        }
    }

    [Serialized]
    [RequireComponent(typeof(PropertyAuthComponent))]
    [RequireComponent(typeof(PublicStorageComponent))]
    [RequireComponent(typeof(StockpileComponent))]
    [RequireComponent(typeof(WorldStockpileComponent))]
    [RequireComponent(typeof(LinkComponent))]
    public partial class SmallStockpileObject : WorldObject
    {
        public override string FriendlyName { get { return "Small Stockpile"; } }

        public static readonly Vector3i DefaultDim = new Vector3i(3, 3, 3);

        protected override void OnCreate()
        {
            base.OnCreate();
            StockpileComponent.ClearPlacementArea(this.Creator.Player, this.Position3i, DefaultDim, this.Rotation);
        }

        protected override void Initialize()
        {
            base.Initialize();

            this.GetComponent<StockpileComponent>().Initialize(DefaultDim);

            var storage = this.GetComponent<PublicStorageComponent>();
            storage.Initialize(DefaultDim.x * DefaultDim.z);
            storage.Storage.AddInvRestriction(new StockpileStackRestriction(DefaultDim.y)); // limit stack sizes to the y-height of the stockpile
            
            this.GetComponent<LinkComponent>().Initialize(7);
        }

        public override void SendInitialState(BSONObject bsonObj, INetObjectViewer viewer)
        {
            base.SendInitialState(bsonObj, viewer);
            bsonObj["noFadeIn"] = true;
        }
    }
}
