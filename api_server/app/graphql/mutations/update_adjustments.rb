module Mutations
  class UpdateAdjustments < BaseMutation
    argument :id, ID, required: true
    argument :value, Float, required: true

    type Types::LineItemType

    def resolve(input)
      line_item = LineItem.find(input[:id])
      if !line_item.reviewed
        line_item.adjustments = input[:value]
        line_item.save!
        line_item
      else
        raise GraphQL::ExecutionError, 'can\'t update a reviewed line_item'
      end
    end
  end
end