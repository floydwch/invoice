module Mutations
  class Review < BaseMutation
    argument :type, String, required: true
    argument :id, Int, required: true
    argument :revoke, Boolean, required: false
    type Boolean

    def resolve(type:, id:, revoke: false)
      case type
      when 'LineItem'
          LineItem.find(id).update(reviewed: !revoke)
      when 'Campaign'
        ActiveRecord::Base.transaction do
          Campaign.find(id).update(reviewed: !revoke)
          Campaign.find(id).line_items.update_all(reviewed: !revoke)
        end
      end
    end
  end
end