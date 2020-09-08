module Mutations
  class UpdateAdjustments < BaseMutation
    argument :id, ID, required: true
    argument :value, Float, required: true

    type Types::LineItemType

    def resolve(input)
      line_item = LineItem.find(input[:id])
      line_item.adjustments = input[:value]
      line_item.save!
      line_item
    end
  end
end