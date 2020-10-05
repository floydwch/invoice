module Mutations
  class ReviewCampaign < BaseMutation
    argument :id, ID, required: true
    argument :revoke, Boolean, required: false
    type Types::CampaignType

    def resolve(id:, revoke: false)
      ActiveRecord::Base.transaction do
        campaign = Campaign.find(id)
        campaign.update!(reviewed: !revoke)
        campaign.line_items.update_all!(reviewed: !revoke)
        campaign
      end
    end
  end
end