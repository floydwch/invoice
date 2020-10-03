module Mutations
  class ReviewLineItem < BaseMutation
    argument :id, Int, required: true
    argument :revoke, Boolean, required: false
    type Types::LineItemType

    def resolve(id:, revoke: false)
      line_item = LineItem.find(id)
      line_item.update!(reviewed: !revoke)
      line_item
    end
  end
end