module Mutations
  class ReviewLineItem < BaseMutation
    argument :id, ID, required: true
    argument :revoke, Boolean, required: false
    type Types::LineItemType

    def resolve(id:, revoke: false)
      line_item = LineItem.find(id)

      ActiveRecord::Base.transaction do
        line_item.update!(reviewed: !revoke)
        all_line_items = LineItem.where(campaign: line_item.campaign)
        campaign = Campaign.find(line_item.campaign.id)

        if all_line_items.all? {|line_item| line_item.reviewed }
          campaign.update!(reviewed: true)
        else
          campaign.update!(reviewed: false)
        end

        line_item
      end
    end
  end
end