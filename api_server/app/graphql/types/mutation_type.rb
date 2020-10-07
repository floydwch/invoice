module Types
  class MutationType < Types::BaseObject
    field :updateAdjustments, mutation: Mutations::UpdateAdjustments
    field :reviewLineItem, mutation: Mutations::ReviewLineItem
    field :reviewCampaign, mutation: Mutations::ReviewCampaign
  end
end
